/**
 * MegaETH Ecosystem Catalogue
 *
 * Curated directory of projects building on MegaETH.
 * Sourced from @bread (CMO, MegaETH)
 */

export interface Project {
  id: string;
  name: string;
  twitter: string;
  description: string;
  category: Category;
  featured?: boolean;
  website?: string;
  logo?: string;
}

export type Category =
  | "defi"
  | "dex"
  | "lending"
  | "launchpad"
  | "aggregator"
  | "options"
  | "perps"
  | "prediction"
  | "depin"
  | "infrastructure"
  | "games"
  | "social"
  | "ai";

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "defi",
    name: "DeFi",
    description: "Decentralized finance protocols",
    color: "#3B82F6",
    icon: "Landmark",
  },
  {
    id: "dex",
    name: "DEX",
    description: "Decentralized exchanges",
    color: "#8B5CF6",
    icon: "ArrowLeftRight",
  },
  {
    id: "lending",
    name: "Lending",
    description: "Lending and credit protocols",
    color: "#10B981",
    icon: "Banknote",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    description: "Token launch platforms",
    color: "#F59E0B",
    icon: "Rocket",
  },
  {
    id: "aggregator",
    name: "Aggregator",
    description: "DEX and liquidity aggregators",
    color: "#EC4899",
    icon: "Layers",
  },
  {
    id: "options",
    name: "Options",
    description: "Options trading protocols",
    color: "#6366F1",
    icon: "LineChart",
  },
  {
    id: "perps",
    name: "Perps",
    description: "Perpetual trading platforms",
    color: "#EF4444",
    icon: "TrendingUp",
  },
  {
    id: "prediction",
    name: "Prediction",
    description: "Prediction markets",
    color: "#14B8A6",
    icon: "Dice5",
  },
  {
    id: "depin",
    name: "DePIN",
    description: "Decentralized physical infrastructure",
    color: "#84CC16",
    icon: "Wifi",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Developer tools and infrastructure",
    color: "#64748B",
    icon: "Server",
  },
  {
    id: "games",
    name: "Games",
    description: "Blockchain games and gaming",
    color: "#F97316",
    icon: "Gamepad2",
  },
  {
    id: "social",
    name: "Social",
    description: "Social applications",
    color: "#06B6D4",
    icon: "Users",
  },
  {
    id: "ai",
    name: "AI",
    description: "AI-powered applications",
    color: "#A855F7",
    icon: "Brain",
  },
];

export const PROJECTS: Project[] = [
  // Lending/Credit
  {
    id: "avon",
    name: "Avon",
    twitter: "avon_xyz",
    description: "First lending CLOB (Central Limit Order Book)",
    category: "lending",
    featured: true,
  },

  // DeFi
  {
    id: "brix",
    name: "Brix Money",
    twitter: "brix_money",
    description: "Bringing Turkish Lira carry trade onchain (most scalable trade in the world)",
    category: "defi",
    featured: true,
  },
  {
    id: "blackhaven",
    name: "Blackhaven",
    twitter: "blackhaven",
    description: "Liquidity engine / onchain DAT of Mega",
    category: "defi",
  },
  {
    id: "supernova",
    name: "Supernova Labs",
    twitter: "SupernovaLabs_",
    description: "Trade yields",
    category: "defi",
  },
  {
    id: "cap",
    name: "Cap Money",
    twitter: "capmoney_",
    description: "First Type III stablecoin",
    category: "defi",
    featured: true,
  },
  {
    id: "aqua",
    name: "Aqua",
    twitter: "useAqua_xyz",
    description: "LRT and Yearn rep onchain",
    category: "defi",
  },

  // DEX
  {
    id: "sectorone",
    name: "Sector One",
    twitter: "SectorOneDEX",
    description: "Native DLMM (Dynamic Liquidity Market Maker)",
    category: "dex",
    featured: true,
  },
  {
    id: "kumbaya",
    name: "Kumbaya",
    twitter: "kumbaya_xyz",
    description: "AMM + launchpad",
    category: "dex",
  },
  {
    id: "warp",
    name: "Warp Exchange",
    twitter: "warpexchange",
    description: "AMM",
    category: "dex",
  },

  // Launchpad
  {
    id: "upside",
    name: "Upside",
    twitter: "UpsideFun",
    description: "Tokenize meta links",
    category: "launchpad",
  },
  {
    id: "kumbaya-launch",
    name: "Kumbaya",
    twitter: "kumbaya_xyz",
    description: "Culture-value flywheel",
    category: "launchpad",
  },
  {
    id: "mania",
    name: "Mania",
    twitter: "ManiaDotFun",
    description: "Memes",
    category: "launchpad",
  },
  {
    id: "muni",
    name: "Muni",
    twitter: "Munidotfun",
    description: "Memes",
    category: "launchpad",
  },

  // Aggregator
  {
    id: "prism",
    name: "Prism Fi",
    twitter: "PrismFi_",
    description: "ProjectX/Jupiter-style aggregation",
    category: "aggregator",
    featured: true,
  },

  // Options
  {
    id: "lora",
    name: "Lora Finance",
    twitter: "LoraFinance",
    description: "Call-only options with streamed payments",
    category: "options",
  },
  {
    id: "leveragesir",
    name: "Leverage Sir",
    twitter: "leveragesir",
    description: "Call-only options with one-time fee",
    category: "options",
  },

  // Perps
  {
    id: "hellotrade",
    name: "HelloTrade",
    twitter: "hellotradeapp",
    description: "Trade equities. Founders are from BlackRock.",
    category: "perps",
    featured: true,
  },
  {
    id: "wcm",
    name: "WCM",
    twitter: "wcm_inc",
    description: "Run carry and basis trades with universal margin",
    category: "perps",
  },
  {
    id: "realtime",
    name: "Realtime DeFi",
    twitter: "realtime_defi",
    description: "CLOB + AMM hybrid",
    category: "perps",
  },

  // Prediction Markets
  {
    id: "rocket",
    name: "Rocket",
    twitter: "userocket_app",
    description: 'Creating "Redistribution markets" to solve long-dated prediction market problem',
    category: "prediction",
  },

  // DePIN
  {
    id: "cilium",
    name: "Cilium",
    twitter: "Cilium_xyz",
    description: "Autonomous travel mapping",
    category: "depin",
  },
  {
    id: "ubitel",
    name: "Ubitel",
    twitter: "getubitel",
    description: "Mobile DePIN. Invented TEE unlock in SIM to allow all devices to become provable edge devices",
    category: "depin",
    featured: true,
  },

  // Infrastructure
  {
    id: "telis",
    name: "Telis",
    twitter: "telisxyz",
    description: "Using math to handle crosschain swaps via hedged perp positions on WCM",
    category: "infrastructure",
  },
  {
    id: "syscall",
    name: "Syscall",
    twitter: "syscall_sdk",
    description: '"Reverse oracle" to trigger offchain actions (SMS, email, etc) from onchain events',
    category: "infrastructure",
    featured: true,
  },
  {
    id: "mtrkr",
    name: "Mtrkr",
    twitter: "mtrkr_xyz",
    description: "Track your Mega presence",
    category: "infrastructure",
  },
  {
    id: "miniblocks",
    name: "MiniBlocks",
    twitter: "MiniBlocksIO",
    description: "Visualize Mega data",
    category: "infrastructure",
  },

  // Games
  {
    id: "showdown",
    name: "Showdown TCG",
    twitter: "Showdown_TCG",
    description: "Poker game created by #1 MtG + #1 Hearthstone player",
    category: "games",
    featured: true,
  },
  {
    id: "stomp",
    name: "Stomp",
    twitter: "stompdotgg",
    description: "Collect, battle and trade monsters",
    category: "games",
  },
  {
    id: "topstrike",
    name: "Top Strike",
    twitter: "TopStrikeIO",
    description: "Real-time football player trading",
    category: "games",
  },
  {
    id: "huntertales",
    name: "Hunter Tales",
    twitter: "playhuntertales",
    description: "MMO by GameFi veterans",
    category: "games",
  },
  {
    id: "megatruther",
    name: "Megatruther",
    twitter: "megatruther",
    description: "Experiential app",
    category: "games",
  },
  {
    id: "aicrypts",
    name: "AiCrypts",
    twitter: "AiCrypts",
    description: "Prompt-based RPG to compete for a prize",
    category: "games",
  },

  // Social
  {
    id: "hashd",
    name: "Hashd",
    twitter: "hashdsocial",
    description: "Cypherpunk social app. Anonymous, encrypted.",
    category: "social",
  },
  {
    id: "lemonaded",
    name: "Lemonaded",
    twitter: "LemonadedApp",
    description: "Event platform (hosting ETHDenver in Feb)",
    category: "social",
    featured: true,
  },
  {
    id: "megawarren",
    name: "Megawarren",
    twitter: "Megawarren87",
    description: "Onchain webhosting + provenance",
    category: "social",
  },
  {
    id: "reach",
    name: "Reach",
    twitter: "reach_eth",
    description: "Grow your social presence with onchain distribution",
    category: "social",
  },

  // AI
  {
    id: "nectar",
    name: "Nectar AI",
    twitter: "TryNectarAI",
    description: "Make your GF/BF/minotaur",
    category: "ai",
    featured: true,
  },
];

// Helper functions
export function getProjectsByCategory(category: Category): Project[] {
  return PROJECTS.filter((p) => p.category === category);
}

export function getFeaturedProjects(): Project[] {
  return PROJECTS.filter((p) => p.featured);
}

export function getCategoryInfo(category: Category): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.id === category);
}

export function searchProjects(query: string): Project[] {
  const lowercaseQuery = query.toLowerCase();
  return PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.twitter.toLowerCase().includes(lowercaseQuery)
  );
}

export function getCategoryCounts(): Record<Category, number> {
  const counts = {} as Record<Category, number>;
  for (const category of CATEGORIES) {
    counts[category.id] = PROJECTS.filter((p) => p.category === category.id).length;
  }
  return counts;
}
