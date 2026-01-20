/**
 * Neynar API integration for Farcaster lookups
 * Resolves usernames/FIDs to Ethereum addresses
 */

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '2C29D27C-E42A-419E-8398-F09783CA29A7';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  follower_count: number;
  custody_address: string;
  verified_addresses?: {
    eth_addresses: string[];
    primary?: {
      eth_address: string;
    };
  };
  pfp_url?: string;
}

export interface ResolvedUser {
  fid: number;
  username: string;
  displayName: string;
  followers: number;
  primaryAddress: string;
  custodyAddress: string;
  verifiedAddresses: string[];
  allAddresses: string[];
  pfpUrl?: string;
}

/**
 * Resolve a Farcaster username to user info and addresses
 */
export async function lookupByUsername(username: string): Promise<ResolvedUser | null> {
  // Remove @ prefix if present
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(cleanUsername)}`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    return parseNeynarUser(data.user);
  } catch (error) {
    console.error('Username lookup error:', error);
    return null;
  }
}

/**
 * Resolve a Farcaster FID to user info and addresses
 */
export async function lookupByFid(fid: number): Promise<ResolvedUser | null> {
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.users && data.users.length > 0) {
      return parseNeynarUser(data.users[0]);
    }
    return null;
  } catch (error) {
    console.error('FID lookup error:', error);
    return null;
  }
}

/**
 * Lookup users by their Ethereum address
 */
export async function lookupByAddress(address: string): Promise<ResolvedUser[]> {
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address.toLowerCase()}`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    const users = data[address.toLowerCase()] || [];
    return users.map(parseNeynarUser);
  } catch (error) {
    console.error('Address lookup error:', error);
    return [];
  }
}

function parseNeynarUser(user: NeynarUser): ResolvedUser {
  const custodyAddress = user.custody_address?.toLowerCase() || '';
  const verifiedAddresses = (user.verified_addresses?.eth_addresses || []).map(a => a.toLowerCase());
  const primaryAddress = (
    user.verified_addresses?.primary?.eth_address?.toLowerCase() ||
    verifiedAddresses[0] ||
    custodyAddress
  );
  const allAddresses = [...new Set([primaryAddress, custodyAddress, ...verifiedAddresses].filter(Boolean))];

  return {
    fid: user.fid,
    username: user.username,
    displayName: user.display_name || user.username,
    followers: user.follower_count || 0,
    primaryAddress,
    custodyAddress,
    verifiedAddresses,
    allAddresses,
    pfpUrl: user.pfp_url,
  };
}

/**
 * Smart resolve - accepts address, username, or FID
 * Returns the primary address to use for lookups
 */
export async function resolveToAddress(input: string): Promise<{
  address: string;
  user?: ResolvedUser;
  type: 'address' | 'username' | 'fid';
} | null> {
  const trimmed = input.trim();
  console.log("[Neynar] Resolving input:", trimmed);

  // Check if it's an Ethereum address
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    console.log("[Neynar] Detected as address");
    const users = await lookupByAddress(trimmed);
    console.log("[Neynar] Resolved address, FC user:", users[0]?.username || "none");
    return {
      address: trimmed.toLowerCase(),
      user: users[0],
      type: 'address',
    };
  }

  // Check if it's a FID (numeric)
  if (/^\d+$/.test(trimmed)) {
    console.log("[Neynar] Detected as FID");
    const fid = parseInt(trimmed, 10);
    const user = await lookupByFid(fid);
    if (user && user.primaryAddress) {
      console.log("[Neynar] Resolved FID to:", user.username, user.primaryAddress);
      return {
        address: user.primaryAddress,
        user,
        type: 'fid',
      };
    }
    console.log("[Neynar] FID not found or no address");
    return null;
  }

  // Treat as username
  console.log("[Neynar] Detected as username");
  const user = await lookupByUsername(trimmed);
  if (user && user.primaryAddress) {
    console.log("[Neynar] Resolved username to:", user.username, user.primaryAddress);
    return {
      address: user.primaryAddress,
      user,
      type: 'username',
    };
  }

  console.log("[Neynar] Username not found");
  return null;
}
