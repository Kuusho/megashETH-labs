/**
 * Neynar API integration for Farcaster lookups
 * Resolves usernames/FIDs to Ethereum addresses
 * + .mega domain integration
 */

import { resolveNameToAddress, resolveAddressToName, type MegaDomain } from './dotmega';

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
  megaName?: string; // .mega domain if registered
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
 * Smart resolve - accepts address, username, FID, or .mega domain
 * Returns the primary address to use for lookups
 */
export async function resolveToAddress(input: string): Promise<{
  address: string;
  user?: ResolvedUser;
  megaDomain?: MegaDomain;
  type: 'address' | 'username' | 'fid' | 'mega';
} | null> {
  const trimmed = input.trim();
  console.log("[Identity] Resolving input:", trimmed);

  // Check if it's an Ethereum address
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    console.log("[Identity] Detected as address");
    
    // Parallel lookup: Farcaster + .mega
    const [users, megaDomain] = await Promise.all([
      lookupByAddress(trimmed),
      resolveAddressToName(trimmed),
    ]);
    
    const user = users[0];
    if (user && megaDomain) {
      user.megaName = megaDomain.name;
    }
    
    console.log("[Identity] Resolved address:", {
      fc: user?.username || "none",
      mega: megaDomain?.name || "none",
    });
    
    return {
      address: trimmed.toLowerCase(),
      user: user || undefined,
      megaDomain: megaDomain || undefined,
      type: 'address',
    };
  }

  // Check if it's a FID (numeric)
  if (/^\d+$/.test(trimmed)) {
    console.log("[Identity] Detected as FID");
    const fid = parseInt(trimmed, 10);
    const user = await lookupByFid(fid);
    if (user && user.primaryAddress) {
      // Also check for .mega name
      const megaDomain = await resolveAddressToName(user.primaryAddress);
      if (megaDomain) user.megaName = megaDomain.name;
      
      console.log("[Identity] Resolved FID to:", user.username, user.primaryAddress);
      return {
        address: user.primaryAddress,
        user,
        megaDomain: megaDomain || undefined,
        type: 'fid',
      };
    }
    console.log("[Identity] FID not found or no address");
    return null;
  }

  // Check if it's a .mega domain
  if (trimmed.endsWith('.mega')) {
    console.log("[Identity] Detected as .mega domain");
    const megaDomain = await resolveNameToAddress(trimmed);
    if (megaDomain && megaDomain.address) {
      // Also check if address has Farcaster
      const users = await lookupByAddress(megaDomain.address);
      const user = users[0];
      if (user) user.megaName = megaDomain.name;
      
      console.log("[Identity] Resolved .mega to:", megaDomain.address);
      return {
        address: megaDomain.address.toLowerCase(),
        user: user || undefined,
        megaDomain,
        type: 'mega',
      };
    }
    console.log("[Identity] .mega domain not found");
    return null;
  }

  // Treat as Farcaster username first
  console.log("[Identity] Trying as Farcaster username");
  const user = await lookupByUsername(trimmed);
  if (user && user.primaryAddress) {
    // Also check for .mega name
    const megaDomain = await resolveAddressToName(user.primaryAddress);
    if (megaDomain) user.megaName = megaDomain.name;
    
    console.log("[Identity] Resolved username to:", user.username, user.primaryAddress);
    return {
      address: user.primaryAddress,
      user,
      megaDomain: megaDomain || undefined,
      type: 'username',
    };
  }

  // Fallback: try as .mega name without suffix
  console.log("[Identity] Trying as .mega name (no suffix)");
  const megaDomain = await resolveNameToAddress(trimmed);
  if (megaDomain && megaDomain.address) {
    const users = await lookupByAddress(megaDomain.address);
    const fcUser = users[0];
    if (fcUser) fcUser.megaName = megaDomain.name;
    
    console.log("[Identity] Resolved as .mega name:", megaDomain.name);
    return {
      address: megaDomain.address.toLowerCase(),
      user: fcUser || undefined,
      megaDomain,
      type: 'mega',
    };
  }

  console.log("[Identity] Could not resolve input");
  return null;
}
