# ☁️ CLOUDFLARE D1 & R2 SETUP GUIDE FOR ADUBIBLE
**Target Scale:** 4 Billion Readers Worldwide  
**Artifacts Provided:**
- Worker: [cloudflare/worker.ts](file:///c:/Users/kwame/Downloads/bible/cloudflare/worker.ts)
- Wrangler Config: [cloudflare/wrangler.toml](file:///c:/Users/kwame/Downloads/bible/cloudflare/wrangler.toml)
- D1 Schema: [cloudflare/schema-d1.sql](file:///c:/Users/kwame/Downloads/bible/cloudflare/schema-d1.sql)
- D1 Seed Script: [scripts/seed-d1.js](file:///c:/Users/kwame/Downloads/bible/scripts/seed-d1.js)
- R2 Sync Script: [scripts/sync-r2-scripture.js](file:///c:/Users/kwame/Downloads/bible/scripts/sync-r2-scripture.js)

---

## Step 1: Install Wrangler CLI & Authenticate

Ensure you have Node.js 18+ installed, then open PowerShell in the project directory:

```powershell
# Authenticate Wrangler with your Cloudflare account
npx wrangler login
```

Verify your account ID:
```powershell
npx wrangler whoami
```

---

## Step 2: Create the Cloudflare R2 Scripture Bucket

Cloudflare R2 provides zero-egress object storage for all Bible chapter JSONs and audio files.

```powershell
# Create the production R2 bucket
npx wrangler r2 bucket create adubible-scripture-vault
```

### Export & Sync Local Chapters to R2
Run the automated AduBible R2 sync script to generate all R2 payloads locally:
```powershell
node scripts/sync-r2-scripture.js
```
This exports all prebundled chapters and seed editions to `dist-r2/chapters/{versionId}/{bookId}/{chapter}.json`.

Upload the manifest to R2:
```powershell
npx wrangler r2 object put adubible-scripture-vault/manifest.json --file=dist-r2/manifest.json
```

*(Optional: In Cloudflare Dashboard > R2 > `adubible-scripture-vault` > Settings > Custom Domains, connect `r2-scripture.adubible.org` to allow direct CDN access!)*

---

## Step 3: Create the Cloudflare D1 Distributed Edge Database

Cloudflare D1 is a serverless, read-replicated SQLite database running at all 330+ Cloudflare edge locations.

```powershell
# Create the D1 database
npx wrangler d1 create adubible-edge-db
```

Wrangler will output something like:
```text
[[d1_databases]]
binding = "DB"
database_name = "adubible-edge-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the generated `database_id` and paste it into [cloudflare/wrangler.toml](file:///c:/Users/kwame/Downloads/bible/cloudflare/wrangler.toml):
```toml
[[d1_databases]]
binding = "DB"
database_name = "adubible-edge-db"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"
```

---

## Step 4: Apply Schema and Seed Data to D1

Execute the D1 schema:
```powershell
npx wrangler d1 execute adubible-edge-db --file=cloudflare/schema-d1.sql
```

Generate and execute the seed data (all 66 canonical books, 41+ versions, and Strong's lexicon tokens):
```powershell
# Generate seed SQL
node scripts/seed-d1.js > cloudflare/seed-data.sql

# Execute seed in D1
npx wrangler d1 execute adubible-edge-db --file=cloudflare/seed-data.sql
```

Verify the data in D1:
```powershell
npx wrangler d1 execute adubible-edge-db --command="SELECT count(*) as total_books FROM books;"
```

---

## Step 5: Deploy the Cloudflare Global Edge Worker

Navigate to the project root and deploy the worker:
```powershell
cd c:\Users\kwame\Downloads\bible\cloudflare
npx wrangler deploy
```

Wrangler will output your live Edge Worker URL:
```text
Published adubible-edge-worker (https://adubible-edge-worker.<your-subdomain>.workers.dev)
```

Test your live Edge Worker healthcheck:
```powershell
curl https://adubible-edge-worker.<your-subdomain>.workers.dev/healthz
```

Expected response:
```json
{
  "status": "healthy",
  "tier": "Cloudflare Planetary Edge",
  "targetCapacity": "4,000,000,000 readers",
  "colo": "LHR",
  "country": "GB",
  "timestamp": "2026-10-26T14:30:00.000Z"
}
```

---

## Step 6: Connect Custom Edge Domain (Optional but Recommended)

In Cloudflare Dashboard > Workers & Pages > `adubible-edge-worker` > Triggers:
1. Add Custom Domain: `edge.adubible.org`
2. Update your frontend `.env` with:
   ```env
   VITE_CLOUDFLARE_EDGE_URL=https://edge.adubible.org
   VITE_R2_SCRIPTURE_URL=https://r2-scripture.adubible.org
   ```
