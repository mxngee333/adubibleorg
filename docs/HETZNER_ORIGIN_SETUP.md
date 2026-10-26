# 🖥️ HETZNER DEDICATED ORIGIN CLUSTER SETUP GUIDE FOR ADUBIBLE
**Target Scale:** 4 Billion Readers (Origin Shield behind Cloudflare)  
**Artifacts Provided:**
- Clustered Server: [hetzner-cluster/server.js](file:///c:/Users/kwame/Downloads/bible/hetzner-cluster/server.js)
- Dockerfile: [hetzner-cluster/Dockerfile](file:///c:/Users/kwame/Downloads/bible/hetzner-cluster/Dockerfile)
- Docker Compose: [hetzner-cluster/docker-compose.yml](file:///c:/Users/kwame/Downloads/bible/hetzner-cluster/docker-compose.yml)
- High-Concurrency Nginx: [hetzner-cluster/nginx.conf](file:///c:/Users/kwame/Downloads/bible/hetzner-cluster/nginx.conf)
- Environment Template: [hetzner-cluster/env.hetzner.example](file:///c:/Users/kwame/Downloads/bible/hetzner-cluster/env.hetzner.example)

---

## 1. Recommended Hetzner Server Sizing

For maximum performance and lowest total cost of ownership (TCO):

| Server Tier | Processor | RAM | Storage | Bandwidth | Monthly Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option A (Dedicated Bare-Metal - Recommended)** | **Hetzner AX42 / AX52** (AMD Ryzen 7 7700 or Ryzen 9 7950X, 8–16 cores / 32 threads) | 64 GB DDR5 ECC | 2x 1TB NVMe Gen4 SSD (RAID 1) | 1 Gbit/s unmetered | **~€46–€64 / mo** |
| **Option B (Cloud VPS - Entry/Dev)** | **Hetzner CPX41** (8 vCPU AMD) | 16 GB RAM | 240 GB NVMe | 20 TB traffic | **~€28 / mo** |

*Note: Since Cloudflare Edge CDN and R2 absorb 99.8% of all read traffic, a single Hetzner AX52 dedicated bare-metal server easily supports origin computing for 4 billion readers.*

---

## 2. Linux OS Kernel & Network Tuning

Log into your Hetzner server via SSH as `root` and optimize Linux kernel limits for high concurrency:

```bash
# Append to /etc/security/limits.conf
cat << 'EOF' >> /etc/security/limits.conf
* soft nofile 1000000
* hard nofile 1000000
* soft nproc 500000
* hard nproc 500000
EOF

# Append to /etc/sysctl.conf for ultra-fast TCP connection handling
cat << 'EOF' >> /etc/sysctl.conf
fs.file-max = 2097152
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.core.netdev_max_backlog = 100000
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq
EOF

# Apply sysctl changes immediately
sysctl -p
```

---

## 3. Deployment Method A: Docker Compose (Direct)

1. Clone or copy your repository to the Hetzner server:
   ```bash
   git clone https://github.com/your-username/adubible.git /opt/adubible
   cd /opt/adubible/hetzner-cluster
   ```

2. Copy the environment file:
   ```bash
   cp env.hetzner.example .env
   ```

3. Start the high-concurrency cluster:
   ```bash
   docker compose up -d --build
   ```

4. Verify running services:
   ```bash
   docker compose ps
   curl http://127.0.0.1:80/healthz
   ```

---

## 4. Deployment Method B: Hetzner Coolify (One-Click UI)

If you use **Coolify** on Hetzner:
1. In Coolify Dashboard, click **New Project** > **New Application**.
2. Select your GitHub repository (`bible` / `adubible`).
3. Set **Build Pack** to `Docker Compose` or `Dockerfile`.
4. Point Dockerfile path to `hetzner-cluster/Dockerfile`.
5. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `WORKERS=8`
6. Click **Deploy**. Coolify automatically provisions Let's Encrypt SSL and exposes your public origin URL (e.g. `https://origin.adubible.org`).

---

## 5. Connecting Hetzner Origin to Cloudflare Edge Worker

Once your Hetzner origin is online at `https://origin.adubible.org`:
1. In Cloudflare Dashboard > DNS > Add `A` record for `origin.adubible.org` pointing to your Hetzner server's public IPv4.
2. Enable Cloudflare Proxy (Orange Cloud) for DDoS shield and IP masking.
3. In [cloudflare/wrangler.toml](file:///c:/Users/kwame/Downloads/bible/cloudflare/wrangler.toml), confirm:
   ```toml
   [vars]
   HETZNER_ORIGIN_URL = "https://origin.adubible.org"
   ```
4. Re-deploy the Cloudflare Worker (`npx wrangler deploy`).
