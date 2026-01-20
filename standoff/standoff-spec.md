# Stand Off: Design Edition - Product Specification

## Executive Summary

Stand Off is an onchain design competition platform that enables designers to compete for prize pools through community-voted battles. Built on Base/Ethereum with Farcaster integration, it creates a trustless, transparent, and engaging way for designers to showcase skills, earn money, and build reputation.

**Target Launch:** 3-4 weeks from kickoff
**Primary Market:** Crypto-native designers on Farcaster
**Core Value Prop:** Compete in design battles, win real money, build onchain portfolio

---

## Product Vision

### The Problem

1. **For Designers:**
   - Hard to get exposure in crowded market
   - Portfolio work doesn't generate immediate income
   - No way to prove skills beyond static portfolio
   - Limited opportunities to compete and grow

2. **For Brands/Projects:**
   - Expensive to hire designers without seeing them work
   - Hard to find crypto-native design talent
   - Design contests on Twitter/Discord are chaotic and untrustworthy

3. **For Design Community:**
   - No transparent, fair way to evaluate design work
   - Voting on Twitter is gameable, opaque
   - Winners determined by follower count, not quality

### The Solution

Stand Off creates:
- **Trustless prize distribution** via smart contracts
- **Transparent voting** onchain with verifiable results
- **Instant payments** to winners automatically
- **Persistent reputation** through onchain competition history
- **Community curation** where voters have skin in the game
- **Viral distribution** through Farcaster Frames

### Success Metrics

**Month 1 (MVP):**
- 5 battles hosted
- 50 total submissions
- 200+ unique voters
- $500+ in prize pools

**Month 3:**
- 40 battles hosted (10/week)
- 400 total submissions
- 2,000+ unique voters
- $5,000+ in prize pools
- 2 sponsor partnerships

**Month 6:**
- 100 battles hosted (25/week)
- 1,500 total submissions
- 10,000+ unique voters
- $20,000+ in prize pools
- 10 sponsor partnerships
- Break-even on operations

---

## User Personas

### Primary Users

**1. Emerging Designer (Sarah)**
- Age: 22-28
- Skills: Brand design, UI/UX
- Goal: Build portfolio, earn side income, get discovered
- Crypto: Uses Farcaster, holds some NFTs, comfortable with wallets
- Pain: Hard to get noticed, needs money, wants proof of skills
- Motivation: Win $100-500, build rep, maybe get hired

**2. Established Designer (Marcus)**
- Age: 28-35
- Skills: Full-stack design, motion, 3D
- Goal: Stay sharp, compete with peers, supplement income
- Crypto: Deep in ecosystem, designs for protocols
- Pain: Bored, wants challenge, portfolio is stale
- Motivation: Competition, respect, keeping skills fresh

**3. Crypto Protocol (BuildFi)**
- Team size: 5-15 people
- Need: Brand refresh, marketing assets, design talent
- Budget: $1k-10k for design work
- Pain: Don't know good designers, risky to hire unknown
- Motivation: See designers compete on their brief, hire winner

### Secondary Users

**4. Design Enthusiast Voter (Alex)**
- Age: 25-40
- Background: Designer or design-adjacent (PM, engineer, founder)
- Goal: Influence outcomes, discover talent, entertainment
- Motivation: Curation rewards, taste reputation, fun

**5. Talent Scout (Jessica)**
- Role: Recruiter or hiring manager
- Goal: Find designers to hire
- Usage: Watches battles, scouts winners
- Motivation: Pre-vetted talent pipeline

---

## Core Features

### MVP (v1.0) - Weeks 1-3

**Battle Creation**
- Admin creates battle with:
  - Title (50 chars max)
  - Prompt/Brief (500 chars max, supports markdown)
  - Entry fee (0.001 - 1 ETH)
  - Deadline (24-168 hours from creation)
  - Category (Brand, UI/UX, Illustration, NFT/Crypto, Motion, Meme)
  - Reference images (optional, 1-3 images)

**Design Submission**
- Designer connects wallet
- Pays entry fee (transaction)
- Uploads design:
  - Single image (PNG/JPG, max 10MB)
  - Uploaded to IPFS via Pinata
  - Title (50 chars)
  - Description (optional, 200 chars)
- Submission confirmed onchain (event emitted)

**Voting**
- Voting period: Starts when first submission, ends at deadline
- Vote mechanism: 1 wallet = 1 vote
- Voters can change vote before deadline
- Voting is free (gas only)
- Results are live (can see current standings)

**Prize Distribution**
- Automatic at deadline
- Winner Takes All mode only
- Distribution:
  - 90% to winner
  - 10% to platform
- Winner can withdraw anytime after battle ends

**Farcaster Frame Integration**
- View active battles
- Browse submissions
- Cast vote
- Share results

**Web Interface (Basic)**
- View all battles (active, upcoming, completed)
- Battle detail page
- Submit design (wallet connect)
- Vote on designs
- View results
- Leaderboard (designers by wins)

### v2.0 Features - Month 2

**Multiple Battle Modes**
- Winner Takes All (90/10 split)
- Top 3 Split (50/30/20)
- Crowd + Judge (50/50 between community pick and judge)

**Enhanced Voting**
- Token-weighted voting (Protardio holders)
- Quadratic voting option
- Anonymous voting (commit-reveal)

**Designer Profiles**
- View all submissions
- Win/loss record
- Total earnings
- Skills/categories
- Social links

**Battle Templates**
- Sponsors can create custom templates
- Pre-filled briefs for common needs
- Faster battle creation

### v3.0 Features - Month 3+

**Sponsor Dashboard**
- Create sponsored battles
- No entry fee for designers (sponsor pays)
- Track submissions
- Message winners
- Hire directly

**NFT Minting**
- Winning designs auto-mint as NFTs
- Designer keeps 97.5%, platform 2.5% secondary
- Collectors can buy winning work

**Team Battles**
- Multiple designers collaborate
- Split prize among team
- Role-based (brand + UI + motion)

**Reputation System**
- ELO-style rating
- Skill badges (NFTs for achievements)
- Tier system (Bronze, Silver, Gold, Platinum)
- Unlock higher-stakes battles

**Advanced Analytics**
- Designer performance metrics
- Voting patterns
- Popular categories
- Time-series data

---

## Technical Architecture

### Stack

**Smart Contracts:**
- Solidity 0.8.20+
- Deployed on Base (lower fees, Farcaster native)
- Foundry for development/testing

**Backend:**
- Node.js + TypeScript
- PostgreSQL for indexing
- Redis for caching
- IPFS (Pinata) for image storage

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- wagmi/viem for web3
- Frog framework for Frames

**Infrastructure:**
- Vercel for hosting (frontend + serverless)
- Supabase or Railway for database
- Pinata for IPFS
- Alchemy/QuickNode for RPC

### Smart Contract Architecture

**Core Contracts:**

```solidity
// BattleFactory.sol - Main orchestration contract
contract BattleFactory {
    struct Battle {
        uint256 id;
        address creator;
        string prompt;
        uint256 entryFee;
        uint256 deadline;
        BattleMode mode;
        BattleStatus status;
        uint256 prizePool;
        address[] participants;
    }
    
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => Submission[]) public submissions;
    mapping(uint256 => mapping(address => Vote)) public votes;
    
    function createBattle(...) external returns (uint256);
    function submitDesign(uint256 battleId, string ipfsHash) external payable;
    function vote(uint256 battleId, uint256 submissionId) external;
    function finalizeBattle(uint256 battleId) external;
    function claimWinnings(uint256 battleId) external;
}

// Submission.sol - Tracks design submissions
struct Submission {
    uint256 id;
    address designer;
    string ipfsHash; // Points to design on IPFS
    uint256 timestamp;
    uint256 voteCount;
    string title;
    string description;
}

// Vote.sol - Voting logic
struct Vote {
    address voter;
    uint256 submissionId;
    uint256 weight; // For token-weighted voting (v2)
    uint256 timestamp;
}

enum BattleMode {
    WinnerTakesAll,
    TopThreeSplit,    // v2
    CrowdAndJudge     // v2
}

enum BattleStatus {
    Active,
    Voting,
    Finalized,
    Cancelled
}
```

**Events:**
```solidity
event BattleCreated(uint256 indexed battleId, address creator, uint256 entryFee);
event DesignSubmitted(uint256 indexed battleId, uint256 submissionId, address designer);
event VoteCast(uint256 indexed battleId, uint256 submissionId, address voter);
event BattleFinalized(uint256 indexed battleId, address winner, uint256 prize);
event WinningsClaimed(uint256 indexed battleId, address winner, uint256 amount);
```

**Prize Distribution Logic:**

```solidity
function finalizeBattle(uint256 battleId) external {
    Battle storage battle = battles[battleId];
    require(block.timestamp >= battle.deadline, "Battle not ended");
    require(battle.status == BattleStatus.Active, "Already finalized");
    
    // Count votes, determine winner
    uint256 winningSubmissionId = _determineWinner(battleId);
    address winner = submissions[battleId][winningSubmissionId].designer;
    
    // Calculate prizes
    uint256 totalPrize = battle.prizePool;
    uint256 platformFee = totalPrize * 10 / 100; // 10%
    uint256 winnerPrize = totalPrize - platformFee;
    
    // Mark as claimable
    battle.status = BattleStatus.Finalized;
    winnings[battleId][winner] = winnerPrize;
    winnings[battleId][platformAddress] = platformFee;
    
    emit BattleFinalized(battleId, winner, winnerPrize);
}

function claimWinnings(uint256 battleId) external {
    uint256 amount = winnings[battleId][msg.sender];
    require(amount > 0, "No winnings");
    
    winnings[battleId][msg.sender] = 0;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
    
    emit WinningsClaimed(battleId, msg.sender, amount);
}
```

### Database Schema

```sql
-- battles table
CREATE TABLE battles (
    id BIGSERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    battle_id BIGINT NOT NULL, -- onchain ID
    creator_address VARCHAR(42) NOT NULL,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    entry_fee DECIMAL(20, 0) NOT NULL, -- wei
    deadline TIMESTAMP NOT NULL,
    category VARCHAR(50),
    mode VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    prize_pool DECIMAL(20, 0),
    created_at TIMESTAMP DEFAULT NOW(),
    finalized_at TIMESTAMP,
    UNIQUE(chain_id, battle_id)
);

-- submissions table
CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    battle_id BIGINT REFERENCES battles(id),
    submission_id BIGINT NOT NULL, -- onchain ID
    designer_address VARCHAR(42) NOT NULL,
    ipfs_hash VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- votes table
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    battle_id BIGINT REFERENCES battles(id),
    submission_id BIGINT REFERENCES submissions(id),
    voter_address VARCHAR(42) NOT NULL,
    weight INTEGER DEFAULT 1,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(battle_id, voter_address) -- One vote per battle per address
);

-- users table (designers)
CREATE TABLE users (
    address VARCHAR(42) PRIMARY KEY,
    farcaster_fid BIGINT,
    username VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    total_wins INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    total_earnings DECIMAL(20, 0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_deadline ON battles(deadline);
CREATE INDEX idx_submissions_battle ON submissions(battle_id);
CREATE INDEX idx_submissions_designer ON submissions(designer_address);
CREATE INDEX idx_votes_battle ON votes(battle_id);
CREATE INDEX idx_votes_submission ON votes(submission_id);
```

### API Endpoints

```typescript
// Battle endpoints
GET    /api/battles              // List all battles (with filters)
GET    /api/battles/:id          // Get battle details
POST   /api/battles              // Create battle (admin only in MVP)

// Submission endpoints
GET    /api/battles/:id/submissions   // List submissions for battle
POST   /api/submissions                // Submit design (triggers contract call)
GET    /api/submissions/:id            // Get submission details

// Voting endpoints
POST   /api/votes                      // Cast vote (triggers contract call)
GET    /api/battles/:id/votes          // Get votes for battle

// User endpoints
GET    /api/users/:address             // Get user profile
GET    /api/users/:address/submissions // User's submission history
GET    /api/users/:address/votes       // User's voting history

// Leaderboard
GET    /api/leaderboard                // Top designers by wins/earnings

// IPFS
POST   /api/upload                     // Upload to IPFS via Pinata
```

### Farcaster Frame Flow

**Frame 1: Battle Discovery**
```
┌─────────────────────────────┐
│   🎨 Active Design Battles   │
├─────────────────────────────┤
│                             │
│  Logo Design Challenge      │
│  Prize: 0.5 ETH             │
│  Entries: 12 | Ends: 2h     │
│                             │
│  [View Entries] [Next ➡️]   │
└─────────────────────────────┘
```

**Frame 2: Battle Detail**
```
┌─────────────────────────────┐
│   Logo Design Challenge     │
├─────────────────────────────┤
│                             │
│ Design a logo for a DeFi    │
│ protocol. Modern, clean.    │
│                             │
│ Entry Fee: 0.02 ETH         │
│ Prize Pool: 0.24 ETH        │
│ Ends: 2 hours               │
│                             │
│ [Enter Battle] [View All]   │
└─────────────────────────────┘
```

**Frame 3: Browse Submissions**
```
┌─────────────────────────────┐
│    [Design Preview Image]   │
├─────────────────────────────┤
│                             │
│ By @designer.eth            │
│ Votes: 23                   │
│                             │
│ ⬅️ Prev | [Vote 🗳️] | Next ➡️│
└─────────────────────────────┘
```

**Frame 4: Voting Confirmation**
```
┌─────────────────────────────┐
│   ✅ Vote Cast!              │
├─────────────────────────────┤
│                             │
│ Your vote for @designer.eth │
│ has been recorded.          │
│                             │
│ Current Standings:          │
│ 1. @designer.eth - 24 votes │
│ 2. @creative.eth - 18 votes │
│                             │
│ [View All] [Share Result]   │
└─────────────────────────────┘
```

**Frame 5: Battle Results**
```
┌─────────────────────────────┐
│   🏆 Winner: @designer.eth   │
├─────────────────────────────┤
│    [Winning Design Image]   │
│                             │
│ Prize Won: 0.216 ETH        │
│ Total Votes: 47             │
│                             │
│ [View All Entries]          │
│ [Next Battle ➡️]             │
└─────────────────────────────┘
```

---

## User Flows

### Flow 1: Designer Enters Battle

1. User sees battle Frame in Farcaster feed
2. Clicks "View Entries" to see competition
3. Clicks "Enter Battle" button
4. Frame redirects to web app
5. Connects wallet (Rainbow/Coinbase Wallet)
6. Uploads design file (PNG/JPG)
7. Enters title and optional description
8. Reviews entry fee (0.02 ETH shown)
9. Clicks "Submit Design"
10. Wallet prompts for transaction approval
11. Transaction confirms
12. Design appears in submissions
13. Receives confirmation (email if provided)
14. Can share submission Frame to Farcaster

### Flow 2: Voter Discovers and Votes

1. Sees battle Frame in feed (shared by friend)
2. Clicks to expand Frame
3. Sees battle details (prize, entries, time left)
4. Clicks "View Entries"
5. Swipes through designs in Frame
6. Clicks "Vote" on favorite
7. Wallet prompts for signature (gasless in Frame)
8. Vote confirmed onchain
9. Frame shows "Vote Cast!" confirmation
10. Can see updated vote counts
11. Can share their vote to feed (optional)

### Flow 3: Battle Finalization

**Automated (ideal):**
1. Deadline passes
2. Keeper bot calls `finalizeBattle()`
3. Contract counts votes, determines winner
4. Prizes marked as claimable
5. Winner notified via Farcaster DM
6. Results Frame generated and shared

**Manual (MVP):**
1. Deadline passes
2. Admin calls `finalizeBattle()` manually
3. Rest of flow same as automated

### Flow 4: Winner Claims Prize

1. Receives notification of win
2. Navigates to battle page
3. Sees "Claim Winnings" button
4. Clicks button
5. Wallet prompts for transaction
6. Confirms transaction
7. ETH transferred to wallet
8. Receipt shown on page
9. Leaderboard updated

### Flow 5: Sponsor Creates Battle

*v2 feature, but important to consider*

1. Sponsor contacts platform or uses dashboard
2. Fills out battle creation form:
   - Company name
   - Brief/prompt
   - Reference materials
   - Budget (prize pool)
3. Reviews and approves
4. Pays sponsor fee ($500-2000)
5. Platform creates battle onchain
6. Battle goes live, no entry fee for designers
7. Sponsor can track submissions
8. After finalization, sponsor can message winner
9. Can hire winner directly through platform

---

## Design System & UI

### Brand Identity

**Name:** Stand Off
**Tagline:** "Compete. Create. Conquer."

**Visual Direction:**
- Bold, high-contrast
- Arena/battle aesthetic without being aggressive
- Professional but energetic
- Crypto-native but accessible

**Colors:**
```
Primary: Electric Blue (#0066FF)
Secondary: Neon Green (#00FF66)
Accent: Hot Pink (#FF0066)
Background: Deep Navy (#0A0F1C)
Surface: Slate (#1A1F2E)
Text Primary: White (#FFFFFF)
Text Secondary: Light Gray (#A0AEC0)
```

**Typography:**
- Headers: Inter Bold / 700
- Body: Inter Regular / 400
- Mono: JetBrains Mono (for addresses, numbers)

### Key Screens

**1. Homepage**
- Hero: "Compete in Design Battles. Win Real Money."
- Active battles grid (6-9 cards)
- Stats: Total prizes awarded, designers competing, battles hosted
- CTA: "Enter a Battle" + "Create Battle" (admin)

**2. Battle Card (Grid Item)**
```
┌─────────────────────────────┐
│  [Category Badge]    [🔥 12]│
│                             │
│  Logo Design Challenge      │
│  Prize: 0.5 ETH ($2,000)    │
│                             │
│  👥 15 entries | ⏱️ 3h left  │
│                             │
│  [View →]                   │
└─────────────────────────────┘
```

**3. Battle Detail Page**

*Header Section:*
- Battle title (large)
- Category badge
- Status indicator (Active/Voting/Ended)
- Countdown timer
- Prize pool (prominent)
- Entry count

*Brief Section:*
- Full prompt/description
- Reference images (if provided)
- Requirements/constraints

*Submissions Grid:*
- Masonry layout of submissions
- Hover shows: Designer, votes, "Vote" button
- Click opens modal with full view

*Sidebar:*
- Entry fee
- Deadline
- Current leader
- Prize distribution breakdown
- "Enter Battle" CTA button

**4. Submission Modal**
```
┌──────────────────────────────────────────┐
│  [< Back]                    [@designer] │
├──────────────────────────────────────────┤
│                                          │
│         [Full Design Image]              │
│                                          │
│  "Modern DeFi Logo"                      │
│  by @designer.eth                        │
│                                          │
│  Description: Clean, minimal approach    │
│  using geometric shapes...               │
│                                          │
│  💚 Vote (47 votes)                      │
│  🔗 Share                                │
│                                          │
│  < Previous | Next >                     │
└──────────────────────────────────────────┘
```

**5. Designer Profile**
- Avatar (from Farcaster or ENS)
- Username / ENS
- Bio
- Stats: Wins, Total entries, Earnings
- Recent submissions (grid)
- Social links (Farcaster, Twitter, Portfolio)

**6. Leaderboard**

*Tabs:*
- Top Earners
- Most Wins
- Rising Stars (new designers trending)

*Leaderboard Row:*
```
#1  [@designer.eth]  12 wins  2.4 ETH  [View Profile →]
```

**7. Submit Design Form**
```
Upload Design
┌─────────────────────────────┐
│                             │
│    [Drop file or browse]    │
│    PNG, JPG (max 10MB)      │
│                             │
└─────────────────────────────┘

Title *
[______________________________]

Description (optional)
[______________________________]
[______________________________]

Entry Fee: 0.02 ETH (~$80)
Your Balance: 0.15 ETH

[Cancel]  [Submit Design ✓]
```

### Responsive Considerations

- Mobile-first design
- Battle cards stack on mobile
- Submissions grid: 1 col mobile, 2 col tablet, 3-4 col desktop
- Frame-friendly (images render well in 1:1, 1.91:1 formats)

---

## Security Considerations

### Smart Contract Security

**Reentrancy Protection:**
- Use OpenZeppelin's ReentrancyGuard
- Follow checks-effects-interactions pattern
- All prize claims use pull pattern (not push)

**Access Control:**
- Only admin can create battles (MVP)
- Only battle participants can submit
- Anyone can vote (but only once per battle)
- Only winners can claim prizes

**Input Validation:**
- Entry fee min/max bounds
- Deadline min/max bounds
- IPFS hash format validation
- Submission count limits per battle

**Edge Cases:**
- What if no submissions? → Battle cancelled, entry fees refunded
- What if tie? → Prize split equally, or use timestamp as tiebreaker
- What if finalization fails? → Emergency withdraw function for admin

**Upgradeability:**
- Use proxy pattern (UUPS) for future upgrades
- Critical functions pausable in emergency
- Timelock for admin actions

### Application Security

**Authentication:**
- Wallet signature for identity (SIWE)
- No passwords, purely wallet-based
- Session tokens for API access (JWT)

**Data Validation:**
- Sanitize all user inputs
- Validate IPFS hashes before storage
- Rate limiting on API endpoints
- File upload validation (type, size, content)

**IPFS Security:**
- Pin uploaded files permanently (Pinata)
- Validate images before pinning
- Check for malicious content (basic scan)
- Restrict file types (PNG, JPG only)

**DOS Protection:**
- Rate limit submissions (max 10/hour per address)
- Rate limit votes (max 50/hour per address)
- Gas limits on contract calls
- Max participants per battle (100 in MVP)

---

## Monetization Strategy

### Revenue Streams

**1. Platform Fees (Primary)**
- 10% of every prize pool
- Example: 0.5 ETH pool = 0.05 ETH to platform
- Scales directly with volume
- No additional work required

**2. Sponsored Battles (v2)**
- Brands pay $500-$5,000 to host
- We create battle, no entry fee for designers
- Revenue: Full sponsor fee
- Platform percentage: Can be lower (5%) since sponsor paid upfront

**3. Featured Battle Placement (v2)**
- Designers pay $50-100 to feature their battle
- Appears at top of listings
- Highlighted in Frames
- More visibility = more votes

**4. Premium Subscriptions (v3)**
- Designers: $10/month for analytics, portfolio tools
- Voters: $5/month for voting insights, early access
- Sponsors: $50/month for talent pipeline access

**5. NFT Secondary Sales (v3)**
- Winning designs mint as NFTs
- Platform takes 2.5% royalty on secondary
- Passive long-term revenue

**6. Recruiting Fees (v3)**
- Companies hire through platform
- 10-15% placement fee (industry standard)
- One-time payment on successful hire

### Pricing Models

**Entry Fees (Designer Pays):**
- Small battles: 0.01 - 0.02 ETH ($40-80)
- Medium battles: 0.03 - 0.05 ETH ($120-200)
- Large battles: 0.1 - 0.5 ETH ($400-2000)

*Reasoning:* Low enough for emerging designers, high enough for meaningful prizes

**Sponsor Battle Pricing:**
- Basic Package: $500 (3-day battle, basic brief)
- Standard Package: $1,500 (5-day battle, detailed brief, featured)
- Premium Package: $3,000+ (7-day battle, judge, NFT minting, hiring pipeline)

### Unit Economics

**Per Battle (Average):**
- 10 designers × 0.02 ETH = 0.2 ETH prize pool ($800)
- Platform fee (10%) = 0.02 ETH ($80)
- Platform cost (IPFS, gas, ops) = ~$5
- Net profit per battle = ~$75

**At Scale:**
- 10 battles/week × $75 = $750/week = $3,000/month
- 25 battles/week × $75 = $1,875/week = $7,500/month
- 50 battles/week × $75 = $3,750/week = $15,000/month

**With Sponsors (Monthly):**
- 4 sponsor battles × $1,500 avg = $6,000/month additional

**Projected Revenue:**

*Month 3:* ~$10,000/month (40 battles + 2 sponsors)
*Month 6:* ~$20,000/month (80 battles + 4 sponsors)
*Month 12:* ~$40,000/month (160 battles + 8 sponsors + premium subs)

### Cost Structure

**Fixed Costs (Monthly):**
- Infrastructure (Vercel, DB, RPC): $200
- IPFS (Pinata): $100
- Tools/Services: $100
- Legal/Accounting: $300
- **Total Fixed: ~$700/month**

**Variable Costs:**
- Gas for finalizations: ~$10/battle
- IPFS per submission: ~$0.10/submission
- Support/moderation: Scales with volume

**Break-Even:**
- Need ~$700/month revenue = ~10 battles/month
- Should hit this by Week 4-6

---

## Go-to-Market Strategy

### Phase 1: Protardio Bootstrap (Weeks 1-2)

**Goal:** Prove concept with warm audience

**Tactics:**
1. Announce to Protardio F&F first
   - Private Telegram/Discord post
   - "Early access for Protardio citizens"
   - First battle: Design Protardio merch graphic

2. First Battle Parameters:
   - Entry fee: 0.01 ETH (low barrier)
   - Your contribution: 0.1 ETH (makes prize pool 0.1 ETH + entries)
   - Duration: 48 hours
   - Voting: Protardio holders only (token-weighted)

3. Document Everything:
   - Behind-the-scenes content
   - Designer testimonials
   - Winner announcement
   - "This is how Stand Off works" explainer

**Success Criteria:**
- 8-12 submissions
- 30+ votes cast
- Winner claims prize smoothly
- 2-3 designers share on Farcaster

### Phase 2: Farcaster Expansion (Weeks 3-4)

**Goal:** Grow beyond Protardio to wider Farcaster design community

**Tactics:**
1. Launch 2-3 battles with Farcaster themes:
   - "Best Farcaster Frame UI"
   - "Redesign Base logo"
   - "Design a channel icon for /higher"

2. Outreach to Farcaster Designers:
   - DM 20-30 established designers
   - "We're launching design battles, want early access?"
   - Offer first entry free for credibility boost

3. Strategic Frames:
   - Post battle Frames to relevant channels (/design, /creative, /higher)
   - Share results Frames with winners tagged
   - Create "Meet the Designer" spotlight Frames

4. Partnerships:
   - Collaborate with /design channel moderators
   - Get featured by Farcaster design influencers
   - Co-host battle with established design community

**Success Criteria:**
- 5-7 battles completed
- 50+ unique designers participated
- 200+ unique voters
- Organic shares (not just from you)

### Phase 3: Sponsor Acquisition (Weeks 5-8)

**Goal:** Land first 3-5 sponsor partnerships

**Tactics:**
1. Create Sponsor Pitch Deck:
   - Traction numbers from Phases 1-2
   - Designer demographics
   - Case studies from first battles
   - ROI calculator (cost per quality submission)

2. Outbound to Crypto Protocols:
   - Target: Early/mid-stage protocols needing design
   - List: Base ecosystem projects, Farcaster apps, DeFi protocols
   - Pitch: "See 10-20 designers compete on your brief for $1k"

3. Create Pilot Package:
   - $500 for first-time sponsors (discounted)
   - Guaranteed 15+ submissions
   - Direct access to winner for hiring
   - Promotion across Farcaster

4. Use Protardio Network:
   - Ask F&F for intros to protocols needing design
   - Offer HGHR Foundation partnership (donate % to grants)

**Success Criteria:**
- 3 sponsor battles completed
- 2 sponsors return for second battle
- 1 sponsor hires a designer
- Generate $1,500+ in sponsor revenue

### Phase 4: Scaling & Iteration (Months 3-6)

**Goal:** Reach 100 battles, 1,000 designers, sustainable revenue

**Tactics:**
1. Establish Rhythm:
   - Weekly featured battles (Monday 12pm ET)
   - Mid-week open battles (Wednesday)
   - Weekend specialty battles (themed)

2. Content Marketing:
   - Designer spotlights (interview winners)
   - Battle recaps with design breakdowns
   - Educational content (design tips from battles)
   - Newsletter to participants

3. Community Building:
   - Stand Off Discord for designers
   - Weekly design critique sessions
   - Designer AMAs with winners
   - Portfolio reviews

4. Product Iteration:
   - Add most-requested features from feedback
   - Improve Frame UX based on analytics
   - Optimize for mobile voting
   - Add categories users want

5. PR & Distribution:
   - Submit to crypto/design publications
   - Podcast interviews about platform
   - Twitter spaces with design communities
   - Collaborate with design schools

**Success Criteria:**
- 100 total battles completed
- 1,000+ unique designers
- 5,000+ unique voters
- $20k+ monthly revenue
- Break-even on operations

---

## Risk Analysis & Mitigation

### Technical Risks

**Risk: Smart contract bug leads to lost funds**
- Mitigation: Full test coverage, professional audit before mainnet, start with small pools, emergency pause function

**Risk: IPFS images disappear (unpinned)**
- Mitigation: Use reliable provider (Pinata), redundant pinning, monitor pin status, repin if needed

**Risk: Blockchain congestion makes participation expensive**
- Mitigation: Deploy on Base (low fees), batch operations where possible, subsidize gas for voters (v2)

**Risk: System can't handle scale (DB, RPC limits)**
- Mitigation: Use scalable infrastructure from day 1, index efficiently, cache aggressively, monitor performance

### Market Risks

**Risk: Not enough designers participate**
- Mitigation: Start with warm Protardio audience, make entry fee low initially, provide value beyond money (portfolio, exposure)

**Risk: Not enough voters**
- Mitigation: Make voting easy (Frame voting), incentivize voting (curation rewards in v2), make results shareable (viral)

**Risk: Sponsors don't see value**
- Mitigation: Start with proven demand (community battles first), show ROI clearly, make hiring pipeline seamless

**Risk: Competitors copy/fork**
- Mitigation: Move fast, build community moat, add features that require trust/curation, protect smart contract with ownership

### Operational Risks

**Risk: Can't moderate bad submissions (spam, offensive)**
- Mitigation: Require entry fee (economic barrier), community flagging, admin review before finalization, ban repeat offenders

**Risk: Voting manipulation (bots, Sybil attacks)**
- Mitigation: Require transaction to vote (costs gas), wallet must have history, token-weighted voting for higher stakes

**Risk: Disputes over winners (accusations of cheating)**
- Mitigation: Transparent onchain voting, clear rules, appeals process, ability to cancel fraudulent battles

**Risk: Legal issues (gambling? securities?)**
- Mitigation: Legal review before launch, ToS that clarifies skill-based competition, operate in friendly jurisdiction, don't operate in US initially

### Business Risks

**Risk: Can't reach profitability**
- Mitigation: Low fixed costs, clear unit economics, multiple revenue streams, focus on sponsored battles if needed

**Risk: Protardio community doesn't engage**
- Mitigation: Make first battles super relevant to them, incentivize with token benefits, involve them in platform decisions

**Risk: Can't retain designers after first battle**
- Mitigation: Create clear progression (reputation system), make winning attainable (not just same people always win), build community

---

## Success Criteria & KPIs

### North Star Metric
**Total Value Distributed to Designers**
- Measures core value prop (designers making money)
- Aligns with mission (empower designers)
- Grows as platform grows

### Key Performance Indicators

**Acquisition:**
- New designers/week
- New voters/week
- Traffic sources
- Farcaster Frame impression

**Engagement:**
- Submissions per battle (target: 10+)
- Votes per battle (target: 50+)
- Repeat designers (target: 30% by month 3)
- Time spent on platform

**Monetization:**
- Revenue per battle
- Platform fee collected
- Sponsor revenue
- Average entry fee

**Retention:**
- Designer return rate (enter 2+ battles)
- Voter return rate (vote in 2+ battles)
- Winner return rate (enter again after winning)

**Quality:**
- Completion rate (battles that finalize successfully)
- Dispute rate (% of battles with issues)
- Average satisfaction (post-battle survey)

### OKRs (Quarterly)

**Q1 Objectives:**
- O1: Prove product-market fit
  - KR1: 50 designers participate
  - KR2: 20 battles completed successfully
  - KR3: 80% designer satisfaction
  
- O2: Build sustainable revenue
  - KR1: $10k total revenue
  - KR2: 3 sponsor partnerships
  - KR3: Break-even on costs

- O3: Establish distribution
  - KR1: 5,000 Frame impressions
  - KR2: 500 unique voters
  - KR3: 50 organic shares/mentions

**Q2 Objectives:**
- O1: Scale core platform
  - KR1: 500 total designers
  - KR2: 100 battles completed
  - KR3: 10% month-over-month growth
  
- O2: Expand revenue streams
  - KR1: $30k total revenue
  - KR2: 10 sponsor battles
  - KR3: Launch premium features

- O3: Build moat
  - KR1: 3 unique features competitors don't have
  - KR2: 500 Discord members
  - KR3: 2 established designer partnerships

---

## Development Roadmap

### Week 1-2: Foundation & MVP Development

**Smart Contracts:**
- [ ] Initialize Foundry project
- [ ] Write BattleFactory contract
  - [ ] Battle creation
  - [ ] Submission logic
  - [ ] Voting mechanism
  - [ ] Prize distribution
  - [ ] Winner claim
- [ ] Write comprehensive tests (80%+ coverage)
- [ ] Deploy to Base Sepolia testnet
- [ ] Write deployment scripts

**Backend:**
- [ ] Initialize Next.js project
- [ ] Set up PostgreSQL + Prisma
- [ ] Create database schema
- [ ] Build indexer for contract events
  - [ ] BattleCreated
  - [ ] DesignSubmitted
  - [ ] VoteCast
  - [ ] BattleFinalized
- [ ] Implement API endpoints
  - [ ] GET /battles
  - [ ] GET /battles/:id
  - [ ] GET /submissions/:id
  - [ ] POST /votes
- [ ] Set up Pinata for IPFS
- [ ] Implement image upload endpoint

**Frontend:**
- [ ] Design system setup (Tailwind, components)
- [ ] Homepage
- [ ] Battle listing page
- [ ] Battle detail page
- [ ] Submission form
- [ ] Voting interface
- [ ] Results display
- [ ] Wallet connection (wagmi)
- [ ] Transaction handling

**Farcaster Frames:**
- [ ] Set up Frog framework
- [ ] Battle discovery Frame
- [ ] Submission viewing Frame
- [ ] Voting Frame
- [ ] Results Frame

### Week 3: Testing & Polish

**Testing:**
- [ ] Smart contract audit (self or peer review)
- [ ] End-to-end testing (battle creation → finalization)
- [ ] Frame testing on Warpcast
- [ ] Mobile responsiveness testing
- [ ] Load testing (simulate 50 concurrent users)

**Polish:**
- [ ] UI/UX refinements
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Success animations
- [ ] Share functionality
- [ ] Analytics integration (PostHog or similar)

**Content:**
- [ ] Write docs (How it works, FAQ, Rules)
- [ ] Create demo video
- [ ] Prepare launch announcement
- [ ] Design social assets

### Week 4: Launch Preparation

**Pre-Launch:**
- [ ] Deploy contracts to Base mainnet
- [ ] Verify contracts on Basescan
- [ ] Set up monitoring (Alchemy Notify, Tenderly)
- [ ] Create first battle (internal test)
- [ ] Run through full flow one more time

**Launch:**
- [ ] Announce to Protardio F&F
- [ ] Create first public battle
- [ ] Post Frames to Farcaster
- [ ] Monitor closely for issues
- [ ] Collect feedback

**Post-Launch:**
- [ ] Daily check-ins on battles
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately
- [ ] Document learnings
- [ ] Plan iteration based on data

### Week 5-8: Iteration & Growth

**v1.1 Improvements:**
- [ ] Based on user feedback from first battles
- [ ] Performance optimizations
- [ ] UX improvements
- [ ] Additional categories
- [ ] Better search/filtering

**Growth Features:**
- [ ] Designer profiles
- [ ] Leaderboard
- [ ] Email notifications (optional)
- [ ] Better sharing (Twitter, Farcaster)
- [ ] Featured battles section

**Sponsor Prep:**
- [ ] Sponsor dashboard (basic)
- [ ] Battle creation form for sponsors
- [ ] Payment flow for sponsors
- [ ] Reporting for sponsors

### Month 3+: Scale & v2

**v2.0 Features:**
- [ ] Multiple battle modes
- [ ] Token-weighted voting
- [ ] Judge integration
- [ ] Team battles
- [ ] Reputation system
- [ ] NFT minting

**Infrastructure:**
- [ ] Scale backend for 100+ battles
- [ ] Optimize database queries
- [ ] CDN for images
- [ ] Better caching strategy

---

## Open Questions & Decisions Needed

### Technical Decisions

1. **Voting Mechanism (MVP):**
   - Simple 1-wallet-1-vote? ✅ (Recommended for MVP)
   - Or token-weighted from day 1?
   - Decision: Start simple, add weighted in v2

2. **Battle Finalization:**
   - Automated with Gelato/Chainlink Automation?
   - Manual by admin? ✅ (Recommended for MVP)
   - Decision: Manual initially, automate at scale

3. **IPFS Provider:**
   - Pinata? ✅ (Recommended - reliable, good API)
   - NFT.Storage? (Free but less features)
   - web3.storage?
   - Decision: Pinata for reliability

4. **Chain Choice:**
   - Base? ✅ (Recommended - Farcaster native, low fees)
   - Ethereum mainnet? (Too expensive)
   - Optimism? (Good alternative)
   - Decision: Base for Farcaster alignment

### Product Decisions

1. **Battle Creation:**
   - Admin-only for MVP? ✅ (Recommended - quality control)
   - Open to anyone with fee?
   - Permissioned (vetted creators)?
   - Decision: Admin-only, open later with fee

2. **Minimum Prize Pool:**
   - Set a minimum to ensure battles are worthwhile?
   - Let market decide (could have tiny battles)?
   - Decision: 0.05 ETH minimum for quality

3. **Maximum Submissions:**
   - Cap at 50 per battle to prevent overwhelming voters?
   - Unlimited?
   - First-come-first-serve if capped?
   - Decision: Cap at 100 for MVP, can increase later

4. **Voting Privacy:**
   - Show live results? ✅ (Recommended - more engaging)
   - Hide until end (like Apple ballot)?
   - Hybrid (hide for first 50% of time)?
   - Decision: Show live, creates excitement

### Business Decisions

1. **Platform Fee:**
   - 10%? ✅ (Recommended - industry standard)
   - 5% (lower but might not be sustainable)?
   - 15% (higher but might deter participants)?
   - Sliding scale based on pool size?
   - Decision: 10% flat, can adjust based on data

2. **Refund Policy:**
   - If battle cancelled, refund entry fees?
   - If no votes, refund?
   - No refunds ever?
   - Decision: Refund if battle cancelled, otherwise no refunds

3. **Sponsor Pricing:**
   - $500-2000 range? ✅ (Recommended to start)
   - Higher for more features?
   - Custom quotes based on needs?
   - Decision: Start with $500-1500 packages, adjust based on demand

4. **Legal Structure:**
   - Operate as individual initially?
   - Set up LLC immediately?
   - DAO structure eventually?
   - Decision: Set up LLC within first month for liability protection

---

## Appendix

### Glossary

**Battle:** A design competition with a specific prompt, deadline, and prize pool

**Submission:** A design entry submitted by a designer to a battle

**Entry Fee:** Amount in ETH a designer pays to enter a battle

**Prize Pool:** Total amount available to be won (sum of entry fees)

**Platform Fee:** Percentage taken by Stand Off from prize pool (10%)

**Voting Period:** Time window when votes can be cast (typically same as battle duration)

**Finalization:** Process of determining winner and making prizes claimable

**Claim:** Action winner takes to withdraw their prize from contract

**Frame:** Farcaster-native interactive embed for viewing/interacting with battles

**IPFS:** Decentralized storage system for design images

### References & Inspiration

**Similar Platforms:**
- 99designs (Web2 design contests)
- DesignCrowd (Web2 design marketplace)
- Dribbble (design portfolio/community)
- Behance (Adobe's design portfolio)

**Crypto Inspiration:**
- Zora (NFT creation platform)
- Sound.xyz (music NFT platform)
- Rabbithole (learn-to-earn platform)
- Layer3 (quest platform with rewards)

**Competition Mechanics:**
- Polymarket (prediction markets)
- Farcaster Bounties (task-based rewards)
- Gitcoin Bounties (developer bounties)

### Contact & Resources

**Team:**
- Your name / role
- Partner name / role
- (Add as team grows)

**Links:**
- Website: [TBD]
- GitHub: [TBD]
- Farcaster: /standoff
- Twitter: @standoff_design
- Discord: [TBD]

**Smart Contracts:**
- Base Mainnet: [Deploy address TBD]
- Base Sepolia: [Testnet address TBD]
- GitHub: [Repo link TBD]

---

## Version History

**v0.1** - Initial specification (January 2, 2025)
- Core concept and architecture defined
- MVP scope established
- Technical stack selected
- Go-to-market strategy outlined

**Future Versions:**
- v0.2 - Post-feedback iteration (after team review)
- v1.0 - Post-MVP launch (after first battles)
- v2.0 - Sponsor features added
- v3.0 - Full platform with all modes

---

*This specification is a living document and will evolve as we build, learn, and iterate.*
