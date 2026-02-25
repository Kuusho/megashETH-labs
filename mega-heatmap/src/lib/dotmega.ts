/**
 * .mega Domain Resolution
 * API docs: https://dotmega.domains/integrate
 * Rate limits: 60 req/min resolve, 20 req/min lookup
 */

const DOTMEGA_API = 'https://api.dotmega.domains';

export interface MegaDomain {
  name: string;
  address: string;
  chain: string;
}

export interface MegaProfile {
  name: string;
  address: string;
  chain: string;
  avatar?: string;
  description?: string;
  twitter?: string;
  // extend as api docs reveal more fields
}

/**
 * Resolve .mega name to address
 * @param name - e.g. "bread.mega" or "bread" (auto-appends .mega)
 */
export async function resolveNameToAddress(name: string): Promise<MegaDomain | null> {
  const cleanName = name.endsWith('.mega') ? name : `${name}.mega`;
  
  try {
    const response = await fetch(
      `${DOTMEGA_API}/resolve?name=${encodeURIComponent(cleanName)}`
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`dotmega API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[dotmega] Name resolution error:', error);
    return null;
  }
}

/**
 * Reverse resolve: address to .mega name
 * @param address - 0x address
 */
export async function resolveAddressToName(address: string): Promise<MegaDomain | null> {
  try {
    const response = await fetch(
      `${DOTMEGA_API}/resolve?address=${encodeURIComponent(address.toLowerCase())}`
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`dotmega API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[dotmega] Address resolution error:', error);
    return null;
  }
}

/**
 * Get full profile for a .mega name
 * Rate limited to 20 req/min
 */
export async function lookupProfile(name: string): Promise<MegaProfile | null> {
  const cleanName = name.endsWith('.mega') ? name : `${name}.mega`;
  
  try {
    const response = await fetch(
      `${DOTMEGA_API}/lookup?name=${encodeURIComponent(cleanName)}`
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`dotmega API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[dotmega] Profile lookup error:', error);
    return null;
  }
}

/**
 * Check if input looks like a .mega domain
 */
export function isMegaDomain(input: string): boolean {
  return input.endsWith('.mega') || /^[a-zA-Z0-9_-]+$/.test(input);
}
