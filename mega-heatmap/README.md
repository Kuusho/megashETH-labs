# Bunny Intel — MegaETH Onchain Analytics

Onchain analytics dashboard for the MegaETH real-time blockchain. Track transaction activity, earn points, and compete on the leaderboard.

---

## Features

- **Transaction Heatmap** — GitHub-style activity graph for any MegaETH address. Tracks 365 days of history with streak detection.
- **Points Dashboard** — Score system based on transactions, gas spent, deployments, and active days. Multipliers for OG/Builder/Power User status.
- **Leaderboard** — Top 100 ranked addresses with pagination and current-user highlighting.
- **Deployments** — Catalogue of MegaETH ecosystem projects with category filtering and TVL/tx enrichment.
- **Heatmap Comparison** — Side-by-side address comparison with win/loss bar visualization.

---

## Design System

**Dark Quant Terminal** — structured data minimalism. Borders and type hierarchy over gradients and glows.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#3b252c` | Background |
| `--color-surface` | `#2d1b22` | Cards, elevated surfaces |
| `--color-border` | `rgba(174,164,191,0.15)` | Structural dividers |
| `--color-text` | `#f5f8de` | Primary text (Beige) |
| `--color-muted` | `#aea4bf` | Labels, secondaries (Lilac Ash) |
| `--color-dim` | `#8f6593` | Disabled, placeholders (Vintage Lavender) |
| `--color-accent` | `#84e296` | CTA, active, positive (Light Green) |

**Typography:** Space Grotesk (headings, UI) + Space Mono (data, addresses, code) via `next/font/google`.

**Heatmap scheme:** Violet by default (`#3b252c → #5e3c4a → #8f6593 → #aea4bf → #84e296`). Fire, Ocean, and Forest schemes also available.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Animation | Framer Motion |
| Wallet | RainbowKit + wagmi + viem |
| State | TanStack Query + Zustand |
| Database | Drizzle ORM + Vercel Postgres |
| Data source | Blockscout API (MegaETH) |
| Icons | Lucide React |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
# or: pnpm install
```

### 2. Environment variables

Create `.env.local`:

```bash
# Vercel Postgres
POSTGRES_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Alchemy (optional, for RPC)
NEXT_PUBLIC_ALCHEMY_ID="..."

# Deployment tracker SQLite path
TRACKER_DB_PATH="../deployment-tracker/data/tracker.db"
```

### 3. Push database schema

```bash
npm run db:push
```

### 4. Run dev server

```bash
npm run dev
# → http://localhost:3000
```

> If the app shows blank/broken after significant style changes, delete `.next/` and restart — webpack chunk hashes invalidate on font/module graph changes.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, providers
│   ├── page.tsx            # Homepage
│   ├── heatmap/            # Heatmap page + compare route
│   ├── dashboard/          # Points dashboard
│   ├── leaderboard/        # Rankings page
│   ├── deployments/        # Ecosystem catalogue
│   └── api/                # API routes
│       ├── user/[address]/
│       ├── leaderboard/
│       └── dashboard/
├── components/
│   ├── layout/             # Header, Footer, HeaderWrapper
│   ├── heatmap/            # Heatmap, HeatmapComparison, StatsCard
│   ├── profile/            # UserProfile, MultiplierBadge
│   ├── leaderboard/        # Leaderboard table
│   ├── dashboard/          # EcosystemStats, DeploymentList
│   └── catalogue/          # ProjectCard, CategoryFilter
├── lib/
│   ├── scoring.ts          # Point calculation engine
│   ├── activity.ts         # Blockscout API + aggregation
│   └── db/                 # Drizzle schema + connection
└── styles/
    └── globals.css         # Design tokens, component classes
```

---

## Scoring Formula

```
base = (txs × 0.5) + (gas_eth × 100) + (deploys × 50) + (active_days × 10) + (account_age_days × 2)
multiplier = OG(1.5×) × Builder(1.2×) × PowerUser(1.3×)
score = floor(base × multiplier)
```

---

## API Endpoints

| Endpoint | Cache TTL | Description |
|---|---|---|
| `GET /api/user/:address` | 5 min | User profile, score, multipliers |
| `GET /api/leaderboard` | 10 min | Top users, pagination + search |
| `GET /api/dashboard/ecosystem` | 15 min | Ecosystem-wide stats |
| `GET /api/dashboard/deployments` | 30 min | Project listings with category filter |

---

## Deployment

```bash
npm run build
vercel --prod
```

Set all environment variables in the Vercel dashboard before deploying.

---

## Docs

- [`implementation_log.md`](./implementation_log.md) — session-by-session build log
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — full deployment and integration guide
- [`BUNNY_INTEL_REDESIGN.md`](./BUNNY_INTEL_REDESIGN.md) — original Bunny Intel rebrand notes

---

*built by Pan · [twitter](https://twitter.com/korewapandesu)*
