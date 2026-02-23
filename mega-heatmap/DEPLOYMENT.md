# MegaETH Heatmap Point System - Deployment Guide

**Status:** Core MVP Complete (90min sprint)
**Date:** 2026-02-22
**Next Step:** Database setup + integration

---

## What Was Built

### ✅ Backend Infrastructure
1. **Database Schema** (`src/lib/db/schema.ts`)
   - Postgres tables for user activity + scores
   - Drizzle ORM integration
   - Proper indexes

2. **Scoring Engine** (`src/lib/scoring.ts`)
   - Point calculation with multipliers
   - Test cases included

3. **Activity Aggregation** (`src/lib/activity.ts`)
   - Blockscout API integration
   - Pagination + retry logic

### ✅ API Endpoints
- `/api/user/:address` - User profile + score
- `/api/leaderboard` - Top users ranking
- `/api/dashboard/ecosystem` - Ecosystem stats
- `/api/dashboard/deployments` - Project listings

### ✅ UI Components
- `UserProfile` - Score display
- `Leaderboard` - Rankings table
- `MultiplierBadge` - Badge UI

---

## Setup Instructions

### 1. Database Setup

Create a Vercel Postgres database (or use existing):

```bash
cd /home/kuusho/ideation-labs/megashETH-labs/mega-heatmap
```

Add to `.env.local`:
```bash
POSTGRES_URL="postgres://default:..."
POSTGRES_URL_NON_POOLING="postgres://default:..."
```

Push schema to database:
```bash
npm run db:push
```

This creates:
- `user_activity` table
- `daily_snapshots` table
- All indexes

### 2. Environment Variables

Create `.env.local`:
```bash
# Vercel Postgres
POSTGRES_URL="..."
POSTGRES_URL_NON_POOLING="..."

# Alchemy (for RPC if needed)
NEXT_PUBLIC_ALCHEMY_ID="..."

# Deployment Tracker DB Path (for dashboard endpoints)
TRACKER_DB_PATH="../deployment-tracker/data/tracker.db"
```

### 3. Test Locally

```bash
npm run dev
```

Test endpoints:
```bash
# User profile (replace with real address)
curl http://localhost:3000/api/user/0x7f3a...

# Leaderboard
curl http://localhost:3000/api/leaderboard?limit=10

# Ecosystem stats
curl http://localhost:3000/api/dashboard/ecosystem

# Deployments
curl http://localhost:3000/api/dashboard/deployments?category=defi
```

### 4. Integration

#### Add UserProfile to Heatmap Page

Edit `src/app/heatmap/page.tsx`:

```tsx
import { UserProfile } from '@/components/profile';

export default function HeatmapPage() {
  return (
    <div>
      {/* Existing heatmap code */}
      <Heatmap address={address} />
      
      {/* Add below heatmap */}
      <div className="mt-8">
        <UserProfile />
      </div>
    </div>
  );
}
```

#### Create Leaderboard Page

Create `src/app/leaderboard/page.tsx`:

```tsx
import { Leaderboard } from '@/components/leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Leaderboard />
    </div>
  );
}
```

Add navigation link in `src/components/layout/Header.tsx`:

```tsx
<Link href="/leaderboard">Leaderboard</Link>
```

### 5. Deploy to Vercel

```bash
git add .
git commit -m "feat: add point system + leaderboard"
git push

# Vercel will auto-deploy
# Or manually: vercel --prod
```

Ensure environment variables are set in Vercel dashboard.

---

## Background Jobs

### Daily Point Recalculation

**Not yet implemented.** Will need a cron job to:
1. Fetch all addresses from `user_activity`
2. Re-aggregate activity from Blockscout
3. Recalculate scores
4. Update ranks

**Options:**
- Vercel Cron (free tier: 1/day)
- External cron service (cron-job.org)
- Manual trigger via API route

**Estimated runtime:** ~10min for 10K users

### Example Cron Job

Create `src/app/api/cron/recalculate/route.ts`:

```tsx
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userActivity } from '@/lib/db/schema';
import { aggregateUserActivity } from '@/lib/activity';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all users
    const users = await db.select({ address: userActivity.address }).from(userActivity);
    
    // Re-aggregate each user
    for (const user of users) {
      const { dbRecord } = await aggregateUserActivity(user.address);
      await db
        .update(userActivity)
        .set(dbRecord)
        .where(eq(userActivity.address, user.address));
    }

    return NextResponse.json({ success: true, updated: users.length });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/recalculate",
    "schedule": "0 0 * * *"
  }]
}
```

---

## Testing Checklist

### API Endpoints
- [ ] `/api/user/:address` returns valid data for active address
- [ ] `/api/user/:address` returns 404 for inactive address
- [ ] `/api/leaderboard` returns top 50 users
- [ ] `/api/leaderboard?search=0x...` finds specific user
- [ ] `/api/dashboard/ecosystem` returns ecosystem stats
- [ ] `/api/dashboard/deployments` returns deployment list

### UI Components
- [ ] UserProfile loads data on wallet connect
- [ ] UserProfile shows correct score + rank
- [ ] Multiplier badges display correctly
- [ ] Leaderboard displays top users
- [ ] Leaderboard pagination works
- [ ] Leaderboard highlights current user

### Performance
- [ ] User endpoint responds in <2s (cold start)
- [ ] User endpoint responds in <500ms (cached)
- [ ] Leaderboard loads in <1s
- [ ] No console errors

---

## Launch Checklist

### Pre-Launch
- [ ] Database tables created
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] UI components integrated
- [ ] Navigation links added
- [ ] Mobile responsive verified

### Launch Day
- [ ] Deploy to production
- [ ] Verify all endpoints live
- [ ] Test wallet connection flow
- [ ] Monitor error logs
- [ ] Post launch tweet

### Week 1
- [ ] Set up daily cron job
- [ ] Monitor API usage
- [ ] Collect user feedback
- [ ] Track first 100 users
- [ ] Document any issues

---

## Architecture Reference

```
User Flow:
1. User connects wallet → RainbowKit + wagmi
2. UserProfile component loads → fetches /api/user/:address
3. API checks DB → if stale, aggregates from Blockscout
4. Metrics calculated → score computed → rank assigned
5. Data returned → UI displays score + badges
6. User can view leaderboard → see all rankings
```

```
Data Flow:
Blockscout API → activity.ts (aggregate) → scoring.ts (calculate)
                                        ↓
                                   user_activity table
                                        ↓
                                   API endpoints
                                        ↓
                                   UI components
```

---

## Known Limitations

1. **No real-time updates** - Points recalculated daily via cron
2. **Blockscout rate limits** - Max ~10 requests/sec, handled via retry logic
3. **Initial aggregation slow** - First load takes 10-30s for active users
4. **No historical snapshots** - `daily_snapshots` table exists but not populated yet

---

## Next Features (Post-Launch)

1. **Historical tracking** - Daily snapshot population
2. **Score breakdown UI** - Show how points are calculated
3. **Social sharing** - Share rank cards
4. **Badges system** - Special achievements
5. **Referral tracking** - Bonus points for referrals

---

## Support

- Implementation plan: `implementation_plan.md`
- Implementation log: `implementation_log.md`
- Database schema: `src/lib/db/schema.ts`
- Scoring logic: `src/lib/scoring.ts`

Questions? Check the implementation log for decisions made and rationale.

**Built by Pan 🐰 in 90 minutes on Claude Opus 4.5**
