# AduBible (Adubible.org) — Developer Handoff & Architecture Guide

Welcome to the **AduBible** source codebase. This repository contains the complete frontend, Static Site Generation (SSG) pre-renderer, Cloudflare edge layer, and Hetzner origin configurations for [AduBible.org](https://adubible.org) — an ads-free, multilingual parallel Bible platform.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x+` (recommended: `v22.x+`)
- **Package Manager**: `npm` (v10+) or `pnpm`
- **Shell**: Bash, Zsh, or PowerShell

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
A `.env.example` template is provided in the root directory. To run locally:
```bash
cp .env.example .env
```
Ensure `VITE_SITE_URL=https://adubible.org` is set.

### 4. Local Development Server
Start the local Vite development server with hot-module replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Build & Verification Scripts

The production build runs a full validation gatekeeper to ensure pristine SEO, WebP triple-ratio imagery, and static pre-rendering:

```bash
# Full production build (favicons + corpus compile + vite build + SSG prerender + gatekeeper)
npm run build

# Preview the compiled production build locally
npm run preview
```

### Individual Utility Scripts:
- `npm run compile-corpus` — Compiles Markdown pillar articles from `src/content/articles` into JSON and TypeScript corpus.
- `npm run compile-legal` — Compiles legal and institutional policy documents into static corpus.
- `npm run compile-authority` — Compiles Top 30 Verses, Topical Scripture Hubs, and Strong's Greek/Hebrew Lexicon into static authority JSON.
- `npm run generate-images` — Generates triple-ratio responsive WebP images for all articles.
- `npm run generate-favicons` — Generates multi-resolution favicon stack and web manifests.
- `npm run verify-content` — Astra Gatekeeper script that audits word counts (>= 2,500 words per article), canonicals, and image integrity.

---

## 📂 Architecture Overview

```
adubible/
├── src/                          # Main React 19 + TypeScript application
│   ├── components/               # UI components, modals, audio bars, slide decks
│   ├── content/                  # High-authority pillar articles and legal markdown
│   ├── data/                     # Bible books metadata, language registries, corpus
│   ├── services/                 # Bible engine, TTS recitation, passage parser, search
│   ├── types/                    # TypeScript interfaces and domain types
│   ├── App.tsx                   # Main application router and state orchestrator
│   └── main.tsx                  # Application bootstrap
├── public/                       # Public assets, brand logos, favicons, audio clips
├── scripts/                      # Build, SSG, image generator, and verification scripts
├── docs/                         # Technical architecture, API specs, schemas, and runbooks
├── cloudflare/                   # Cloudflare Worker, D1 schema, and edge configs
├── hetzner-cluster/              # Dedicated origin cluster Docker and Nginx configs
├── build-ssg.js                  # Production static site generation (SSG) engine
├── firebase.json                 # Firebase Hosting rewrites and cache-control rules
├── package.json                  # Dependencies and build pipelines
└── DEVELOPER_GUIDE.md            # This handoff onboarding guide
```

---

## 📜 Key Architectural Features

1. **Multilingual Parallel Study**: Supports 35+ languages, dual/triple/quad side-by-side translation reading, Strong's Concordance, and Matthew Henry commentaries.
2. **Scripture Slide Mode**: Presentation-grade full-screen slide deck with 8 themes and smooth auto-scroll.
3. **Verse Card Studio**: High-res 1080p verse card generator with radial gradients, dynamic typography auto-scaling, and 1:1 Square & 9:16 Story aspect ratios.
4. **24kHz Neural Audio Recitation**: Expressive voice preview, continuous chapter playout, and Modelissa-standard sync.
5. **SSG Prerendering**: Server-side pre-rendered static HTML routes for all articles, legal pages, and canonical hubs for instant CWV scores and SEO.
