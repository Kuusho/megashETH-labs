/**
 * Profile Wallets API
 *
 * POST /api/profile/wallets  → link a secondary wallet to an existing profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { recoverMessageAddress } from 'viem';
import { db } from '@/lib/db';
import { userProfiles, profileWallets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIG_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTimestampFromMessage(message: string): Date | null {
  const match = message.match(/Timestamp:\s*(.+)$/m);
  if (!match) return null;
  const d = new Date(match[1].trim());
  return isNaN(d.getTime()) ? null : d;
}

function normalizeAddress(addr: string): string {
  return addr.toLowerCase();
}

// ─── POST /api/profile/wallets ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: {
    profileId: string;
    address: string;
    signature: string;
    message: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { profileId, address, signature, message } = body;

  if (!profileId || !address || !signature || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  // 1. Profile must exist
  const profileRows = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, profileId));

  if (profileRows.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // 2. Timestamp check
  const timestamp = parseTimestampFromMessage(message);
  if (!timestamp) {
    return NextResponse.json({ error: 'Cannot parse timestamp from message' }, { status: 400 });
  }
  if (Date.now() - timestamp.getTime() > SIG_WINDOW_MS) {
    return NextResponse.json({ error: 'Signature expired — please re-sign' }, { status: 400 });
  }

  // 3. Signature verification
  try {
    const recovered = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const normalizedAddress = normalizeAddress(address);

  // 4. Address must not already be linked to any profile
  const existing = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.address, normalizedAddress));

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Address already linked to a profile' }, { status: 409 });
  }

  const now = Math.floor(Date.now() / 1000);

  // 5. Insert secondary wallet
  await db.insert(profileWallets).values({
    profileId,
    address: normalizedAddress,
    isPrimary: false,
    signature,
    message,
    addedAt: now,
  });

  // Return updated wallet list
  const allWallets = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.profileId, profileId));

  return NextResponse.json({
    wallets: allWallets.map(w => ({
      address: w.address,
      isPrimary: w.isPrimary,
      addedAt: w.addedAt,
    })),
  }, { status: 201 });
}
