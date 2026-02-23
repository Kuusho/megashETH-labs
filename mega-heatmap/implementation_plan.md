# MegaETH Heatmap + Point System - Implementation Plan

**Date:** 2026-02-22
**Sprint Duration:** 3 hours
**Goal:** Ship point system + enriched data dashboard for $PAN airdrop funnel

---

## Overview

Transform the existing heatmap into an airdrop farming system:
1. **Point calculation engine** - Reward MegaETH activity with mystery points
2. **User profile API** - Serve individual user stats + points
3. **Leaderboard system** - Competitive ranking
4. **Enriched data dashboard** - Deployment tracker integration
5. **Frontend integration** - Display points, rank, stats

---

## Current State Audit

### ✅ Existing Infrastructure
- Next.js 14 heatmap app (`/mega-heatmap`)
- Transaction history hooks (`useTransactionHistory.ts`)
- Wallet connection (RainbowKit + wagmi)
- Deployment tracker with SQLite DB (`tracker.db`)
- Enrichment pipeline (ecosystem + project metrics)
- API server skeleton (x402-gated endpoints)

### 🔴 Missing Components
- Point calculation logic
- User activity aggregation
- Leaderboard storage + API
- Enriched data endpoints
- Dashboard UI components

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (Next.js)                          │
│  - Heatmap visualization                     │
│  - Point display + rank                      │
│  - Enriched data dashboard                   │
│  - Leaderboard view                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼ API calls
┌─────────────────────────────────────────────┐
│  API Routes (/api/*)                         │
│  - /api/user/:address (points, rank, stats)  │
│  - /api/leaderboard (top 100)                │
│  - /api/dashboard/ecosystem                  │
│  - /api/dashboard/deployments                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼ Read/Write
┌─────────────────────────────────────────────┐
│  Database Layer                              │
│  - user_activity (address, points, metrics)  │
│  - tracker.db (deployment data)              │
└─────────────────────────────────────────────┘
                  │
                  ▼ Enrichment
┌─────────────────────────────────────────────┐
│  Background Jobs (cron)                      │
│  - Daily point recalculation                 │
│  - Activity aggregation                      │
│  - Deployment enrichment (existing)          │
└─────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Phase 1: Point System Backend (45 min)

#### 1.1 Database Schema
**File:** `/src/lib/db/schema.ts` (new)

```sql
CREATE TABLE IF NOT EXISTS user_activity (
  address TEXT PRIMARY KEY,
  total_txs INTEGER DEFAULT 0,
  gas_spent_wei TEXT DEFAULT '0',
  gas_spent_eth REAL DEFAULT 0,
  contracts_deployed INTEGER DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  first_tx_timestamp INTEGER,
  last_tx_timestamp INTEGER,
  megaeth_native_score INTEGER DEFAULT 0,
  rank INTEGER,
  last_updated INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS daily_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  txs_that_day INTEGER DEFAULT 0,
  gas_spent_that_day TEXT DEFAULT '0',
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(address, snapshot_date)
);

CREATE INDEX idx_user_score ON user_activity(megaeth_native_score DESC);
CREATE INDEX idx_user_rank ON user_activity(rank);
CREATE INDEX idx_user_updated ON user_activity(last_updated);
```

**Actions:**
- [ ] Create `/src/lib/db/schema.ts`
- [ ] Add Drizzle ORM schema definitions
- [ ] Create migration script
- [ ] Initialize tables via `db:push`

---

#### 1.2 Point Calculation Engine
**File:** `/src/lib/scoring.ts` (new)

**Formula:**
```typescript
base_points = (
  txs * 0.5 +
  (gas_spent_eth * 100) +
  (contracts_deployed * 50) +
  (days_active * 10) +
  (days_since_first_tx * 2)
)

multipliers:
  - if first_tx_date <= "2026-02-09": * 1.5  // OG bonus
  - if contracts_deployed > 0: * 1.2         // builder bonus  
  - if avg_tx_per_day > 50: * 1.3            // power user bonus

megaeth_native_score = int(base_points)
```

**Functions needed:**
```typescript
interface UserMetrics {
  address: string;
  total_txs: number;
  gas_spent_eth: number;
  contracts_deployed: number;
  days_active: number;
  first_tx_timestamp: number;
  last_tx_timestamp: number;
}

function calculateScore(metrics: UserMetrics): number;
function getMultipliers(metrics: UserMetrics): number;
function updateUserActivity(address: string): Promise<UserMetrics>;
function recalculateAllScores(): Promise<void>;
function getRank(address: string): Promise<number | null>;
```

**Actions:**
- [ ] Create `/src/lib/scoring.ts`
- [ ] Implement point calculation logic
- [ ] Add multiplier detection
- [ ] Create activity aggregation from RPC

---

#### 1.3 User Activity Aggregation
**File:** `/src/lib/activity.ts` (new)

**Flow:**
```
1. Fetch tx history for address (via Blockscout API)
2. Parse:
   - total tx count
   - sum gas spent
   - detect contract deployments (to == null)
   - calculate unique days active
   - first/last tx timestamps
3. Store in user_activity table
4. Calculate score
5. Update rank (relative to all users)
```

**Blockscout API:**
```
GET https://megaeth.blockscout.com/api/v2/addresses/{address}/transactions
Response: { items: [...], next_page_params: {...} }
```

**Actions:**
- [ ] Create `/src/lib/activity.ts`
- [ ] Implement Blockscout tx fetching (paginated)
- [ ] Parse tx data for metrics
- [ ] Handle contract deployments detection
- [ ] Add error handling + rate limiting

---

### Phase 2: API Routes (30 min)

#### 2.1 User Profile Endpoint
**File:** `/src/app/api/user/[address]/route.ts` (new)

**Endpoint:** `GET /api/user/:address`

**Response:**
```json
{
  "address": "0x...",
  "metrics": {
    "total_txs": 1247,
    "gas_spent_eth": 0.34,
    "contracts_deployed": 2,
    "days_active": 8,
    "first_tx_date": "2026-02-09",
    "avg_tx_per_day": 155.875
  },
  "score": {
    "megaeth_native_score": 847,
    "rank": 234,
    "total_users": 12401,
    "percentile": 98.1
  },
  "multipliers": {
    "og_bonus": true,
    "builder_bonus": true,
    "power_user_bonus": false
  },
  "last_updated": "2026-02-22T19:54:00Z"
}
```

**Actions:**
- [ ] Create API route
- [ ] Add request validation
- [ ] Implement caching (5min TTL)
- [ ] Add CORS headers
- [ ] Return 404 if address never active

---

#### 2.2 Leaderboard Endpoint
**File:** `/src/app/api/leaderboard/route.ts` (new)

**Endpoint:** `GET /api/leaderboard?limit=100&offset=0`

**Response:**
```json
{
  "total_users": 12401,
  "limit": 100,
  "offset": 0,
  "leaderboard": [
    {
      "rank": 1,
      "address": "0x7f3a...",
      "score": 12847,
      "total_txs": 3421,
      "days_active": 14
    },
    ...
  ],
  "updated_at": "2026-02-22T19:00:00Z"
}
```

**Actions:**
- [ ] Create API route
- [ ] Add pagination support
- [ ] Implement caching (10min TTL)
- [ ] Add search by address (return position in leaderboard)

---

#### 2.3 Dashboard Data Endpoints
**Files:** 
- `/src/app/api/dashboard/ecosystem/route.ts`
- `/src/app/api/dashboard/deployments/route.ts`

**Ecosystem Endpoint:** `GET /api/dashboard/ecosystem`

**Response:**
```json
{
  "total_tvl": 80900000,
  "total_tvl_formatted": "$80.9M",
  "total_addresses": 577000,
  "total_txs": 45200000,
  "txs_24h": 2170000,
  "avg_block_time": 1.0,
  "deployment_count": 36,
  "top_project": {
    "name": "Kumbaya",
    "tvl": 53100000
  },
  "updated_at": "2026-02-22T19:00:00Z"
}
```

**Deployments Endpoint:** `GET /api/dashboard/deployments?category=defi&limit=20`

**Response:**
```json
{
  "count": 20,
  "deployments": [
    {
      "id": "deployment-001",
      "project": "Kumbaya",
      "category": "defi",
      "tvl_usd": 53100000,
      "tvl_formatted": "$53.1M",
      "contract_address": "0x...",
      "verified": true,
      "tx_count": 145023,
      "score": 95,
      "classification": "blue-chip",
      "twitter": "@kumbaya_xyz",
      "deployed_at": "2026-01-05"
    },
    ...
  ]
}
```

**Actions:**
- [ ] Create ecosystem route (queries deployment tracker DB)
- [ ] Create deployments route (with filtering)
- [ ] Add category filter support
- [ ] Join with project_metrics table for enrichment
- [ ] Implement caching (15min TTL for ecosystem, 30min for deployments)

---

### Phase 3: Frontend Integration (60 min)

#### 3.1 User Profile Component
**File:** `/src/components/UserProfile.tsx` (new)

**Features:**
- Display MegaETH Native Score with 🥖 emoji
- Show rank + percentile
- List all metrics in cards
- Show multiplier badges
- "Points update daily" disclaimer

**Design:**
```
┌─────────────────────────────────────────────┐
│  Your MegaETH Activity                       │
├─────────────────────────────────────────────┤
│  Transactions:           1,247               │
│  Gas Spent:              0.34 ETH            │
│  Contracts Deployed:     2                   │
│  Days Active:            8 / 14              │
│  First Transaction:      Feb 9, 2026         │
├─────────────────────────────────────────────┤
│  MegaETH Native Score:   🥖 847 points       │
│  Rank:                   #234 / 12,401       │
│                                              │
│  Badges:                                     │
│  🌟 OG User  🛠️ Builder                      │
├─────────────────────────────────────────────┤
│  Points update daily. Keep building. 🐰     │
└─────────────────────────────────────────────┘
```

**Actions:**
- [ ] Create component with TailwindCSS
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add refresh button (refetch data)
- [ ] Create badge components for multipliers

---

#### 3.2 Leaderboard Component
**File:** `/src/components/Leaderboard.tsx` (new)

**Features:**
- Top 100 users table
- Highlight current user's position
- Pagination controls
- Search by address
- Auto-refresh every 5 minutes

**Design:**
```
┌────────────────────────────────────────────┐
│  MegaETH Native Leaderboard                 │
├────┬────────────┬────────┬──────┬──────────┤
│ #  │ Address    │ Score  │ Txs  │ Days     │
├────┼────────────┼────────┼──────┼──────────┤
│ 1  │ 0x7f3a...  │ 12,847 │3,421 │ 14       │
│ 2  │ 0x9b2c...  │ 11,203 │2,987 │ 13       │
│... │            │        │      │          │
│234 │ 0x...  YOU │    847 │1,247 │  8  ← 🥖│
└────┴────────────┴────────┴──────┴──────────┘

Updated daily at midnight UTC
```

**Actions:**
- [ ] Create table component
- [ ] Add highlight for current user
- [ ] Implement pagination
- [ ] Add address search functionality
- [ ] Auto-refresh with React Query

---

#### 3.3 Dashboard Component
**File:** `/src/components/Dashboard.tsx` (new)

**Features:**
- Ecosystem overview cards (TVL, addresses, txs, deployments)
- Top projects table (enriched data from deployment tracker)
- Category filters
- Deployment timeline
- Live metrics (updated every 30s)

**Design:**
```
┌─────────────────────────────────────────────┐
│  MegaETH Ecosystem                           │
├─────────────────────────────────────────────┤
│  Total TVL:          $80.9M                  │
│  Active Addresses:   577K                    │
│  Total Txs:          45.2M                   │
│  Deployments:        36 projects             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Top Projects by TVL                         │
│                                              │
│  [DeFi] [DEX] [Lending] [All]  ← filters    │
├─────────────────────────────────────────────┤
│  1. Kumbaya        $53.1M    ✓ Verified     │
│  2. Aave V3        $12.4M    ✓ Verified     │
│  3. Uniswap V4     $8.7M     ✓ Verified     │
│  ...                                         │
└─────────────────────────────────────────────┘
```

**Actions:**
- [ ] Create dashboard layout
- [ ] Add stat cards with animations
- [ ] Create projects table with filtering
- [ ] Implement category filter UI
- [ ] Add auto-refresh (30s for ecosystem, 5min for projects)
- [ ] Link to project details

---

#### 3.4 Updated Heatmap Page
**File:** `/src/app/heatmap/page.tsx` (update existing)

**Changes:**
- Add UserProfile component below heatmap
- Show points prominently
- Add "View Leaderboard" button
- Link to dashboard

**Actions:**
- [ ] Integrate UserProfile component
- [ ] Add navigation to leaderboard
- [ ] Update layout for new sections
- [ ] Add "mystery points" messaging (no explanation)

---

### Phase 4: Background Jobs (30 min)

#### 4.1 Daily Point Recalculation
**File:** `/scripts/recalculate-points.ts` (new)

**Function:**
- Fetch all addresses from user_activity table
- For each address:
  - Fetch latest tx history from Blockscout
  - Recalculate metrics
  - Update score
- Recalculate ranks (sort all users by score)
- Store snapshot in daily_snapshots

**Cron:** Daily at 00:00 UTC

**Actions:**
- [ ] Create script
- [ ] Add progress logging
- [ ] Implement batching (100 addresses per batch)
- [ ] Add error recovery
- [ ] Store completion timestamp

---

#### 4.2 Activity Aggregation on Connect
**File:** `/src/lib/activity.ts` (update)

**Function:**
- When user connects wallet:
  - Check if address exists in user_activity
  - If not, or if last_updated > 1 day:
    - Fetch latest data
    - Calculate score
    - Store/update record
  - Return data immediately

**Actions:**
- [ ] Add "on-demand" aggregation function
- [ ] Implement caching to avoid redundant fetches
- [ ] Add rate limiting (max 1 request per address per 5 min)

---

### Phase 5: Polish & Deploy (15 min)

#### 5.1 Copy & Messaging
- Landing page: "MegaETH Activity Heatmap" → "Track your onchain activity on the real-time blockchain"
- Point explanation: None (mystery)
- Footer: "Built by Pan 🐰"

**Actions:**
- [ ] Update copy on landing page
- [ ] Add "What are these points?" → "Keep building. 👀"
- [ ] Add Pan branding

---

#### 5.2 Deployment Checklist
- [ ] Environment variables (.env.local)
  - `NEXT_PUBLIC_ALCHEMY_ID`
  - `BLOCKSCOUT_API_URL`
  - `DEPLOYMENT_TRACKER_DB_PATH`
- [ ] Build production bundle
- [ ] Test all API routes
- [ ] Verify point calculations
- [ ] Test wallet connection flow
- [ ] Deploy to Vercel
- [ ] Test production URL

---

## File Structure

```
mega-heatmap/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── user/[address]/route.ts       [NEW]
│   │   │   ├── leaderboard/route.ts          [NEW]
│   │   │   └── dashboard/
│   │   │       ├── ecosystem/route.ts        [NEW]
│   │   │       └── deployments/route.ts      [NEW]
│   │   ├── heatmap/page.tsx                  [UPDATE]
│   │   ├── leaderboard/page.tsx              [NEW]
│   │   └── dashboard/page.tsx                [NEW]
│   ├── components/
│   │   ├── UserProfile.tsx                   [NEW]
│   │   ├── Leaderboard.tsx                   [NEW]
│   │   ├── Dashboard.tsx                     [NEW]
│   │   └── MultiplierBadge.tsx               [NEW]
│   └── lib/
│       ├── db/
│       │   └── schema.ts                     [NEW]
│       ├── scoring.ts                        [NEW]
│       └── activity.ts                       [NEW]
├── scripts/
│   └── recalculate-points.ts                 [NEW]
└── implementation_log.md                     [NEW]
```

---

## Success Criteria

- [ ] User can connect wallet and see their MegaETH Native Score
- [ ] Points are calculated correctly based on onchain activity
- [ ] Leaderboard shows top 100 users with real-time ranking
- [ ] Dashboard displays enriched deployment tracker data
- [ ] All API endpoints return data within 500ms (cached)
- [ ] Daily cron job recalculates all scores successfully
- [ ] Mobile responsive design
- [ ] No crashes or errors in production

---

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: Backend | 45 min | Database + scoring + activity aggregation |
| Phase 2: API | 30 min | 4 API routes + caching |
| Phase 3: Frontend | 60 min | 3 new components + heatmap integration |
| Phase 4: Background Jobs | 30 min | Cron + on-demand aggregation |
| Phase 5: Polish | 15 min | Copy + deployment |
| **Total** | **3 hours** | |

---

## Risk Mitigation

### API Rate Limiting
- **Risk:** Blockscout API rate limits during mass fetch
- **Mitigation:** 
  - Implement exponential backoff
  - Batch requests (max 10/sec)
  - Cache aggressively (5min TTL)

### Database Performance
- **Risk:** Slow queries on large user_activity table
- **Mitigation:**
  - Add indexes on score + rank columns
  - Implement pagination (max 100 results)
  - Use DB connection pooling

### Point Gaming
- **Risk:** Users spam transactions to farm points
- **Mitigation:**
  - Gas spent is primary factor (expensive to game)
  - Builder bonus requires contract deployment (high barrier)
  - Daily recalculation prevents real-time manipulation

---

## Post-Launch

### Week 1 Monitoring
- Track API error rates
- Monitor Blockscout API usage
- Watch for point gaming attempts
- Collect user feedback

### Week 2 Iteration
- Add more multipliers based on user behavior
- Introduce special badges (e.g., "First Deployer")
- Build referral tracking system
- Add social sharing features

### Airdrop Reveal (Week 3-4)
- Announce $PAN airdrop tied to points
- Add snapshot date countdown
- Introduce presale multipliers
- Launch claim portal

---

## Notes

- Keep point calculation transparent in code but mysterious in UI
- No explanation of what points do until $PAN reveal
- Focus on clean, fast UX — users should want to check back daily
- Leaderboard creates social proof + competition
- Dashboard positions Pan as ecosystem intelligence layer

---

**Next Step:** Begin Phase 1 - Database Schema + Scoring Engine
