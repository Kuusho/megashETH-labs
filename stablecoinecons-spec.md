# Stablecoin Economics Dashboard

## Overview
A comprehensive visualization platform that makes stablecoin economics transparent and understandable. Shows how USDm (MegaETH) and cUSD (Cap Protocol) create value through different economic models, with focus on MegaGDP metrics and real-world impact.

## Core Value Proposition
**"See how modern stablecoins actually work"**

Most people don't understand stablecoin economics:
- Where does yield come from?
- How do they stay pegged?
- What makes them sustainable?
- Why do some subsidize gas while others pay users?

This dashboard answers all of that with live data and clear visualizations.

## Page Structure

### Landing View

```
┌──────────────────────────────────────────────────────────┐
│  Stablecoin Economics Dashboard                          │
│  Understanding how USDm and cUSD power their ecosystems  │
└──────────────────────────────────────────────────────────┘

Select Stablecoin:
[USDm (MegaETH)] [cUSD (Cap Protocol)]

Quick Stats:
USDm                              cUSD
$500M supply                      $XXM supply
#5 L2 by revenue                  X% APY guaranteed
$1.6M/month revenue               XX active operators
```

## USDm Section (MegaETH)

### Tab 1: Economic Model

**The USDm Flywheel Visualization:**
```
┌─────────────────────────────────────────────┐
│  How USDm Creates Sustainable Economics     │
│                                             │
│    1. USDm Reserves ($500M)                │
│           ↓                                 │
│    2. Backed by USDtb                      │
│       (BlackRock BUIDL fund)               │
│           ↓                                 │
│    3. Generates Yield                      │
│       (~4-5% APY from US Treasuries)       │
│           ↓                                 │
│    4. Yield → MegaETH Operations           │
│       (Sequencer costs, development)       │
│           ↓                                 │
│    5. Lower Gas Fees                       │
│       (At-cost, no markup)                 │
│           ↓                                 │
│    6. More Apps Deploy                     │
│       (Economics make sense)               │
│           ↓                                 │
│    7. More USDm Needed                     │
│       (TVL increases)                      │
│           ↓                                 │
│    8. Cycle Repeats ↺                      │
│                                             │
│  This is the "MegaGDP" flywheel            │
└─────────────────────────────────────────────┘
```

**Key Metrics Display:**
```
Reserve Health:
├─ Total USDm Supply: $500,000,000
├─ Backing Asset: USDtb (1:1 ratio)
├─ Reserve Yield Rate: 4.5% APY
├─ Daily Yield Generated: $61,644
└─ Status: Fully Backed ✓

Network Economics:
├─ Daily Sequencer Costs: ~$45,000 (estimated)
├─ Yield Coverage: ~137% (self-sustaining)
├─ Subsidy to Users: $16,644/day extra
└─ Model: Sustainable ✓

Gas Impact:
├─ Current Gas Price: 0.003 gwei
├─ Comparable L2s: 0.045 gwei (Base)
├─ User Savings: 93% cheaper
└─ Enabled by: Reserve yield covering ops
```

### Tab 2: MegaGDP Metrics

**What is MegaGDP?**
```
MegaGDP = Total Economic Activity Enabled by USDm

Three components:
1. Revenue Generated (fees, yields, value creation)
2. TVL Growth (total value locked in ecosystem)
3. Transaction Volume (value transferred)

Think: Like GDP for a country, but for MegaETH's economy
```

**MegaGDP Dashboard:**
```
┌─────────────────────────────────────────────┐
│  MegaETH Economic Activity (30 Days)        │
├─────────────────────────────────────────────┤
│                                             │
│  Total MegaGDP:   $124,500,000             │
│                                             │
│  Breakdown:                                 │
│  ├─ Revenue Generated:    $1,643,836       │
│  ├─ TVL Growth:           $87,200,000      │
│  └─ Transaction Volume:   $35,656,164      │
│                                             │
│  [Line Chart: MegaGDP over time]           │
│                                             │
│  Growth Rate: +23% MoM                     │
└─────────────────────────────────────────────┘

Revenue Breakdown:
├─ Transaction Fees:     $1,234,567
├─ MEV Revenue:          $287,453
├─ Bridge Fees:          $98,234
└─ Other:                $23,582

TVL by Category:
├─ DeFi Protocols:       $45M
├─ Liquid Staking:       $23M
├─ NFT Marketplaces:     $12M
├─ Gaming:               $5M
└─ Other:                $2.2M

Transaction Volume by Type:
├─ DEX Swaps:            $18M
├─ Transfers:            $12M
├─ NFT Sales:            $3M
└─ Other:                $2.6M
```

**Revenue Comparison (Image 2 Recreation):**
```
┌─────────────────────────────────────────────┐
│  USDm Revenue Comparison                    │
│  Compare MegaETH against other major chains │
├─────────────────────────────────────────────┤
│                                             │
│  Total USDm Supply: $500,000,000           │
│  MegaETH Placement: #5                     │
│  30D Revenue: $1,643,836                   │
│  24H Revenue: $54,795                      │
│                                             │
│  Revenue Leaderboard (30 Days):            │
│                                             │
│  #1  TRON                                  │
│      30D: $31,012,625  |  24H: $935,407   │
│      ████████████████████████████████      │
│                                             │
│  #2  ETHEREUM                              │
│      30D: $8,742,407   |  24H: $122,666   │
│      ████████████                          │
│                                             │
│  #3  BASE                                  │
│      30D: $7,839,272   |  24H: $101,124   │
│      ███████████                           │
│                                             │
│  #4  SOLANA                                │
│      30D: $3,170,356   |  24H: $90,141    │
│      █████                                 │
│                                             │
│  #5  MEGAETH                               │
│      30D: $1,643,836   |  24H: $54,795    │
│      ██                                    │
│                                             │
│  [View Full Leaderboard]                   │
└─────────────────────────────────────────────┘

Why MegaETH ranks here:
• New chain (launched Dec 2025)
• Focus on quality over volume
• Revenue per transaction: $0.000391 (vs Ethereum $0.000127)
• Growing rapidly (+23% MoM)
```

### Tab 3: Gas Economics

**Gas Subsidy Impact:**
```
How Reserve Yield Lowers Gas Costs

Traditional L2 Model (Base):
├─ Sequencer operates for profit
├─ Charges markup on L1 data costs
├─ Gas price: Market-driven
└─ User pays: Full cost + profit margin

MegaETH Model (USDm):
├─ Sequencer operates at-cost
├─ Reserve yield covers operations
├─ Gas price: Cost-based
└─ User pays: Just transaction cost

Real Numbers (Today):
├─ MegaETH gas: 0.003 gwei
├─ Base gas: 0.045 gwei
├─ Difference: 15x cheaper
└─ Reason: $16,644/day subsidy from yield

[Interactive Slider: "If you made X transactions"]
Transactions: [100 ▬▬▬●▬▬▬ 10,000]

Your Cost:
├─ On MegaETH: $0.045
├─ On Base: $0.675
├─ Saved: $0.630 (93%)
└─ Courtesy of: USDm reserve yield
```

**Sustainability Analysis:**
```
Is This Model Sustainable?

Current Math:
├─ USDm Supply: $500M
├─ Yield Rate: 4.5%
├─ Annual Yield: $22.5M
├─ Daily Yield: $61,644
│
├─ Sequencer Costs: ~$45,000/day
├─ Coverage Ratio: 137%
└─ Extra Yield: $16,644/day → ecosystem

Break-Even Analysis:
"If MegaETH needed $61,644/day to operate,
 current reserves would cover 100% at 4.5% yield"

Growth Scenarios:
├─ 2x transaction volume → need $90k/day
│   Requires: $730M USDm (46% growth)
│
├─ 5x transaction volume → need $225k/day
│   Requires: $1.83B USDm (266% growth)
│
└─ 10x transaction volume → need $450k/day
    Requires: $3.65B USDm (630% growth)

Flywheel Effect:
As MegaETH grows → more USDm needed → more yield →
more subsidy → more attractive → more growth ↺

[Chart: Required USDm supply vs transaction volume]
```

### Tab 4: USDtb Backing Deep Dive

**Reserve Transparency:**
```
What Actually Backs USDm?

USDm Supply: $500M
     ↓
Backed 1:1 by USDtb
     ↓
USDtb holds:
├─ BlackRock BUIDL Fund (primary)
│   └─ Tokenized US Treasury bonds
│   └─ Current holdings: ~$10B total fund
│
├─ Liquid Stablecoins (for redemptions)
│   └─ USDC/USDT reserves
│   └─ Instant liquidity: 24/7
│
└─ Securitize Platform (tokenization)
    └─ Institutional-grade custody
    └─ Real-time transparency

Yield Generation:
├─ US Treasury yields: 4.5-5% currently
├─ BUIDL fund performance: ~4.5% APY
├─ No risky strategies (pure treasuries)
└─ Predictable, sustainable returns

Risk Profile:
├─ Counterparty: US Government (Treasury bonds)
├─ Custody: BlackRock + Securitize
├─ Transparency: On-chain verification
└─ Rating: Lowest risk possible for yield

[Link to BlackRock BUIDL fund details]
[Link to Securitize transparency page]
```

## cUSD Section (Cap Protocol)

### Tab 1: Economic Model

**The cUSD Operator Model:**
```
┌─────────────────────────────────────────────┐
│  How cUSD Generates Yield Safely            │
│                                             │
│    1. Users Mint cUSD                      │
│       (Deposit USDC/USDT)                  │
│           ↓                                 │
│    2. cUSD Issued 1:1                      │
│       (Redeemable anytime)                 │
│           ↓                                 │
│    3. Operators Borrow cUSD                │
│       (Must post collateral via EigenLayer)│
│           ↓                                 │
│    4. Operators Run Strategies             │
│       (DeFi, trading, lending, etc.)       │
│           ↓                                 │
│    5. Operators Generate Yield             │
│       (Proprietary strategies)             │
│           ↓                                 │
│    6. Yield Shared with Minters            │
│       (Users get passive returns)          │
│           ↓                                 │
│    7. Minimum Yield Guaranteed             │
│       (Pegged to Aave rates)               │
│           ↓                                 │
│    8. Operators Compete ⚡                  │
│       (Best performers attract more volume)│
│                                             │
│  This is "Type 3" stablecoin design        │
└─────────────────────────────────────────────┘
```

**Key Metrics Display:**
```
Supply & Backing:
├─ Total cUSD Supply: $XXM (TBD - query contract)
├─ Redemption Ratio: 1:1 (USDC/USDT)
├─ Total Operators: XX active
└─ Total Collateral: $XXM (EigenLayer)

Yield Performance:
├─ Current APY: X.XX%
├─ Minimum Guaranteed: X.XX% (Aave peg)
├─ Top Operator APY: X.XX%
├─ Average Operator APY: X.XX%
└─ vs Aave: +X.XX% premium

User Protection:
├─ Collateral Type: EigenLayer restaking
├─ Slashing Risk: Operators, not users
├─ Smart Contract: Programmatic guarantees
└─ Redemption: Always available 24/7

Operator Ecosystem:
├─ Active Operators: XX
├─ Total Borrowed cUSD: $XXM
├─ Collateral Ratio: XXX% (over-collateralized)
└─ Default Rate: 0% (since launch)
```

### Tab 2: Operator Performance

**Operator Leaderboard:**
```
┌─────────────────────────────────────────────┐
│  Top Performing Operators (30 Days)         │
├─────────────────────────────────────────────┤
│                                             │
│  #1  Operator Alpha                        │
│      APY: 8.4% | Volume: $45M | Risk: Low  │
│      Strategy: DeFi lending + LP           │
│      [View Details]                         │
│                                             │
│  #2  Operator Beta                         │
│      APY: 7.9% | Volume: $32M | Risk: Med  │
│      Strategy: Algorithmic trading         │
│      [View Details]                         │
│                                             │
│  #3  Operator Gamma                        │
│      APY: 7.2% | Volume: $28M | Risk: Low  │
│      Strategy: Stablecoin farming          │
│      [View Details]                         │
│                                             │
│  [View All Operators]                      │
└─────────────────────────────────────────────┘

Operator Detail View:
┌─────────────────────────────────────────────┐
│  Operator Alpha                             │
├─────────────────────────────────────────────┤
│  Performance:                               │
│  ├─ 30D APY: 8.4%                          │
│  ├─ 90D APY: 7.8%                          │
│  ├─ All-Time APY: 7.5%                     │
│  └─ Volatility: Low (±0.3%)                │
│                                             │
│  Volume & Collateral:                       │
│  ├─ cUSD Borrowed: $45M                    │
│  ├─ Collateral Posted: $67.5M (150%)      │
│  ├─ Restakers Backing: 234                │
│  └─ Collateral Type: ETH via EigenLayer   │
│                                             │
│  Strategy:                                  │
│  ├─ Type: DeFi lending + Liquidity pools  │
│  ├─ Protocols: Aave, Compound, Curve      │
│  ├─ Risk Level: Low (blue chip only)      │
│  └─ Auto-compound: Yes                     │
│                                             │
│  Historical Performance:                    │
│  [Line Chart: APY over time]               │
│                                             │
│  Risk Metrics:                              │
│  ├─ Max Drawdown: -0.8% (one day)         │
│  ├─ Sharpe Ratio: 2.4 (excellent)         │
│  ├─ Days Operating: 180                    │
│  └─ Slashing Events: 0                     │
└─────────────────────────────────────────────┘
```

**Yield Distribution:**
```
How Your Yield is Generated (Real-Time)

Your cUSD Holdings: [Connect Wallet]
Current APY: 7.8% (weighted average)

Your Yield Sources:
┌─────────────────────────────────────────────┐
│  Operator Alpha    (60% of your cUSD)       │
│  Contributing: 8.4% APY → 5.04% to you     │
│                                             │
│  Operator Beta     (25% of your cUSD)       │
│  Contributing: 7.9% APY → 1.98% to you     │
│                                             │
│  Operator Gamma    (15% of your cUSD)       │
│  Contributing: 7.2% APY → 1.08% to you     │
│                                             │
│  Total Blended: 8.1% APY                   │
└─────────────────────────────────────────────┘

Minimum Guaranteed: 5.2% (Aave peg)
You're earning: 7.8% (2.6% premium)

[Chart: Your yield vs Aave over time]
```

### Tab 3: Risk & Security

**User Protection Mechanisms:**
```
How Cap Protocol Protects Your Funds

Layer 1: Smart Contract Logic
├─ Minimum yield guaranteed (Aave peg)
├─ Programmatically enforced
├─ No DAO votes needed
└─ Always redeemable 1:1

Layer 2: Operator Collateral
├─ Operators must post 150%+ collateral
├─ Backed by EigenLayer restaking
├─ Slashable if operator defaults
└─ Your funds always covered

Layer 3: Restaker Security
├─ Institutional restakers back operators
├─ Economic security: $XXM staked
├─ Restakers lose money if operators fail
└─ Aligned incentives

Layer 4: Multi-Protocol Integration
├─ Morpho: Lending infrastructure
├─ EigenLayer: Shared security
├─ Audited by: [Audit firms TBD]
└─ Battle-tested protocols

What Can Go Wrong?
├─ Operator strategy fails
│   → Collateral slashed, you're made whole
│
├─ Smart contract exploit
│   → Insurance fund covers (if any)
│
├─ EigenLayer failure
│   → Restakers lose, operators lose, but you're covered
│   → (This would be catastrophic for DeFi generally)
│
└─ Bank run / liquidity crisis
    → Redemption queue + liquid reserves
    → May take time but 1:1 guaranteed

Risk Comparison:
├─ Traditional stablecoins (USDC):
│   └─ Risk: Centralized (Circle/bank risk)
│
├─ Algorithmic stablecoins (UST):
│   └─ Risk: Death spiral possible
│
├─ cUSD (Type 3):
│   └─ Risk: Distributed across operators
│   └─ Protected by: Collateral + guarantees
```

### Tab 4: Comparison to Other Models

**Type 1 vs Type 2 vs Type 3:**
```
┌─────────────────────────────────────────────┐
│  Stablecoin Model Comparison                │
├─────────────────────────────────────────────┤
│                                             │
│  Type 1 (Team-Controlled):                 │
│  Example: Tether (USDT), Circle (USDC)    │
│  ├─ Yield: Team decides where to invest   │
│  ├─ Trust: Central entity                 │
│  ├─ Transparency: Variable (audits)       │
│  └─ Risk: Centralization                  │
│                                             │
│  Type 2 (DAO-Governed):                    │
│  Example: DAI (MakerDAO)                   │
│  ├─ Yield: DAO votes on parameters        │
│  ├─ Trust: Distributed governance         │
│  ├─ Transparency: High (on-chain)         │
│  └─ Risk: Governance attacks, slow        │
│                                             │
│  Type 3 (Operator-Based):                  │
│  Example: cUSD (Cap Protocol)              │
│  ├─ Yield: Institutional operators        │
│  ├─ Trust: Smart contract guarantees      │
│  ├─ Transparency: High (on-chain)         │
│  └─ Risk: Operator strategies + collateral│
│                                             │
│  [Table: Feature Comparison]               │
└─────────────────────────────────────────────┘

Feature Matrix:
                Type 1    Type 2    Type 3
Yield Rate      Low       Medium    High
User Control    None      Low       None
Transparency    Medium    High      High
Decentralization Low      High      Medium
Risk Profile    Bank      Gov       Operator
Guarantees      None      Soft      Hard
Speed           Fast      Slow      Fast
Complexity      Low       High      Medium
```

## Data Sources & APIs

### USDm Data Collection

**On-Chain Sources:**
```javascript
// USDm contract queries
const usdmContract = new ethers.Contract(
  USDM_ADDRESS,
  USDM_ABI,
  provider
);

// Total supply
const totalSupply = await usdmContract.totalSupply();

// USDtb backing (need to verify actual implementation)
const backing = await usdmContract.totalReserves();

// Yield generated (calculated from backing assets)
const yieldGenerated = await calculateYield(backing, APY);
```

**MegaETH Network Data:**
```javascript
// Transaction volume
const volume = await calculateDailyVolume(MEGAETH_RPC);

// Gas prices
const gasPrice = await provider.getFeeData();

// Revenue (from transaction fees)
const revenue = await calculateRevenue(blocks);

// TVL (from DeFi protocols)
const tvl = await aggregateTVL(PROTOCOLS);
```

**External APIs:**
```javascript
// BlackRock BUIDL fund data (if available)
const buidlData = await fetch('https://securitize.io/api/buidl');

// Aave rates (for comparison)
const aaveRate = await fetch('https://aave-api.com/rates');

// DeFi Llama (for TVL)
const tvl = await fetch('https://api.llama.fi/tvl/megaeth');
```

### cUSD Data Collection

**On-Chain Sources:**
```javascript
// cUSD contract
const cusdContract = new ethers.Contract(
  CUSD_ADDRESS,
  CUSD_ABI,
  provider
);

// Total supply
const supply = await cusdContract.totalSupply();

// Operator data (assuming registry contract)
const operatorRegistry = new ethers.Contract(
  OPERATOR_REGISTRY,
  REGISTRY_ABI,
  provider
);

const operators = await operatorRegistry.getActiveOperators();

for (const operator of operators) {
  const performance = await operatorRegistry.getPerformance(operator);
  const collateral = await operatorRegistry.getCollateral(operator);
  // Store in database
}
```

**EigenLayer Data:**
```javascript
// Restaking info (via EigenLayer contracts)
const eigenContract = new ethers.Contract(
  EIGEN_STRATEGY,
  EIGEN_ABI,
  provider
);

// Total restaked for cUSD operators
const restaked = await eigenContract.getTotalRestaked();
```

**Morpho Integration:**
```javascript
// Lending data (if cUSD uses Morpho)
const morphoData = await fetch('https://api.morpho.xyz/...');
```

## Frontend Architecture

### Tech Stack
```
Framework: Next.js 14 (App Router)
Styling: TailwindCSS + shadcn/ui
Charts: Recharts (for line/bar charts)
State: React Context + SWR (data fetching)
Web3: Wagmi + Viem (wallet connection)
```

### Page Structure
```
/economics
  /                          # Landing/selector page
  /usdm                      # USDm dashboard
  /usdm/model               # Economic model tab
  /usdm/megagdp             # MegaGDP metrics tab
  /usdm/gas                 # Gas economics tab
  /usdm/backing             # USDtb deep dive tab
  /cusd                      # cUSD dashboard
  /cusd/model               # Economic model tab
  /cusd/operators           # Operator performance tab
  /cusd/risk                # Risk & security tab
  /cusd/comparison          # Type 1/2/3 comparison tab
```

### Key Components
```
/components/economics
  /usdm
    USDmFlywheel.tsx         # Animated flywheel diagram
    ReserveHealth.tsx        # Supply/backing metrics
    GasComparison.tsx        # Gas price comparison
    RevenueLeaderboard.tsx   # Chain revenue comparison
    MegaGDPChart.tsx        # GDP over time chart
    SustainabilityCalc.tsx   # Break-even calculator
  
  /cusd
    OperatorModel.tsx        # Operator flow diagram
    OperatorCard.tsx         # Individual operator display
    YieldDistribution.tsx    # User yield breakdown
    RiskLayers.tsx           # Security visualization
    TypeComparison.tsx       # Type 1/2/3 table
  
  /shared
    StablecoinSelector.tsx   # Toggle between USDm/cUSD
    MetricCard.tsx           # Reusable stat display
    TooltipInfo.tsx          # Educational tooltips
    DataRefresh.tsx          # "Last updated" indicator
```

## Educational Content

### Tooltips & Explainers

**Throughout dashboard:**
```
Hover Terms:
- "USDtb" → "Ethena's treasury-backed stablecoin using BlackRock BUIDL"
- "MegaGDP" → "Total economic activity enabled by USDm (revenue + TVL + volume)"
- "Type 3 Stablecoin" → "Yield outsourced to institutional operators, not team or DAO"
- "EigenLayer" → "Restaking protocol that provides shared security"
- "Aave peg" → "Minimum yield guaranteed matches Aave's lending rate"

Click-to-learn:
- "How does USDtb generate yield?" → Full explainer modal
- "What happens if an operator fails?" → Risk breakdown
- "Why is MegaETH gas so cheap?" → Gas economics lesson
```

### Comparison Section

**Side-by-side view:**
```
┌─────────────────────────────────────────────┐
│  USDm vs cUSD: Different Solutions          │
├─────────────────────────────────────────────┤
│                                             │
│  Problem:                                   │
│  USDm: "How to fund L2 operations?"        │
│  cUSD: "How to generate yield safely?"     │
│                                             │
│  Solution:                                  │
│  USDm: Reserve yield subsidizes network    │
│  cUSD: Operators compete for best returns  │
│                                             │
│  User Benefit:                              │
│  USDm: Lower gas fees (indirect)           │
│  cUSD: Direct yield payments (direct)      │
│                                             │
│  Risk Model:                                │
│  USDm: US Treasury bonds (ultra-safe)      │
│  cUSD: Operator strategies (higher risk)   │
│                                             │
│  Ideal For:                                 │
│  USDm: Frequent transactors on MegaETH    │
│  cUSD: Yield seekers (any chain)          │
│                                             │
│  Not competing - solving different problems │
└─────────────────────────────────────────────┘
```

## Marketing & Distribution

### Launch Strategy

**Pre-Launch:**
```
Twitter/Farcaster campaign:
"Most people don't understand stablecoin economics.

We built a dashboard that makes it crystal clear:
- Where does USDm's yield go? (Gas subsidies)
- How does cUSD protect users? (Operator collateral)
- What's MegaGDP? (Total economic activity)

Launching Jan 20"
```

**Launch Day:**
```
"Stablecoin Economics Dashboard is live.

See how USDm powers MegaETH's cheap gas.
Understand how cUSD generates yield safely.

First transparent view into modern stablecoin models.

[Link]"
```

### Growth Tactics

**Educational Content:**
```
Blog Series:
1. "How USDm Creates a Sustainable L2"
2. "Type 3 Stablecoins Explained"
3. "MegaGDP: Measuring Onchain Economies"
4. "Reserve Yield vs Operator Yield"
5. "The Future of Stablecoin Design"

Each links back to dashboard for live data
```

**Social Proof:**
```
Daily stats posted:
"MegaETH Economics Update:
- MegaGDP: $124.5M (+3% 24h)
- USDm yield: $61,644/day
- Gas subsidy: 137% coverage
- User savings: $16,644/day

View details: [link]"
```

**Partnerships:**
```
Collaborate with:
- MegaETH team (official feature)
- Cap Protocol (official integration)
- DeFi educators (share dashboard)
- Crypto researchers (cite data)
- Block explorers (embed widgets)
```

## Success Metrics

### Week 1
- 500+ unique visitors
- 50+ wallet connections
- Featured by MegaETH official
- Shared 100+ times on social

### Month 1
- 5,000+ unique visitors
- 500+ daily active users
- Cited by 3+ crypto news articles
- Integrated by 1+ partner

### Month 3
- 20,000+ unique visitors
- 2,000+ daily active users
- Reference source for stablecoin research
- API requests from 5+ developers

## Technical Roadmap

### Phase 1: USDm Section (Week 1)
**Time: 15-20 hours**
- Economic model visualization
- MegaGDP metrics
- Revenue comparison
- Gas economics

### Phase 2: cUSD Section (Week 2)
**Time: 15-20 hours**
- Operator model visualization
- Performance tracking
- Risk explainers
- Type comparison

### Phase 3: Data Infrastructure (Week 3)
**Time: 10-15 hours**
- Automated data collection
- Database setup (PostgreSQL)
- Caching layer (Redis)
- API endpoints

### Phase 4: Polish (Week 4)
**Time: 10-15 hours**
- Mobile responsive
- Chart optimizations
- Educational content
- SEO optimization

**Total: 50-70 hours (2-3 weeks)**

## Open Questions

1. **cUSD contract addresses?** Need exact addresses on each chain
2. **Operator API?** Does Cap expose operator data or query contracts?
3. **MegaGDP calculation?** Exact formula from MegaETH team?
4. **Update frequency?** Real-time, hourly, daily for different metrics?
5. **API access?** Allow developers to query our aggregated data?
6. **Revenue model?** Free dashboard or premium features?
7. **Historical data?** How far back to store (storage costs)?

---

**Next Steps:**
1. Research cUSD contract architecture
2. Contact Cap Protocol for API access
3. Clarify MegaGDP calculation with MegaETH
4. Set up data collection infrastructure
5. Begin frontend scaffolding