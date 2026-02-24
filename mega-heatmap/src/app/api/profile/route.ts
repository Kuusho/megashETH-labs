/**
 * Profile API
 *
 * GET  /api/profile?address=0x...  → fetch profile + all wallets + combinedScore
 * POST /api/profile                → create profile (verify timestamp + sig)
 */

import { NextRequest, NextResponse } from 'next/server';
import { recoverMessageAddress } from 'viem';
import { db } from '@/lib/db';
import { userProfiles, profileWallets, userActivity } from '@/lib/db/schema';
import { eq, inArray, sum } from 'drizzle-orm';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIG_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract the ISO timestamp embedded in the signed message */
function parseTimestampFromMessage(message: string): Date | null {
  const match = message.match(/Timestamp:\s*(.+)$/m);
  if (!match) return null;
  const d = new Date(match[1].trim());
  return isNaN(d.getTime()) ? null : d;
}

/** Normalize address to lowercase */
function normalizeAddress(addr: string): string {
  return addr.toLowerCase();
}

// ─── GET /api/profile?address=0x... ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  const normalizedAddress = normalizeAddress(address);

  // Find wallet row
  const walletRows = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.address, normalizedAddress));

  if (walletRows.length === 0) {
    return NextResponse.json({ error: 'No profile for this address' }, { status: 404 });
  }

  const profileId = walletRows[0].profileId;

  // Fetch the profile
  const profileRows = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, profileId));

  if (profileRows.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const profile = profileRows[0];

  // Fetch all wallets for this profile
  const allWallets = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.profileId, profileId));

  const walletAddresses = allWallets.map(w => w.address);

  // Compute combined score from userActivity
  let combinedScore = 0;
  if (walletAddresses.length > 0) {
    const scoreResult = await db
      .select({ total: sum(userActivity.megaethNativeScore) })
      .from(userActivity)
      .where(inArray(userActivity.address, walletAddresses));

    combinedScore = Number(scoreResult[0]?.total ?? 0);
  }

  // Fetch individual scores per wallet
  const activityRows = walletAddresses.length > 0
    ? await db
        .select({ address: userActivity.address, score: userActivity.megaethNativeScore })
        .from(userActivity)
        .where(inArray(userActivity.address, walletAddresses))
    : [];

  const scoreByAddress = new Map(activityRows.map(r => [r.address, r.score]));

  return NextResponse.json({
    profile: {
      id: profile.id,
      primaryAddress: profile.primaryAddress,
      displayName: profile.displayName,
      createdAt: profile.createdAt,
    },
    wallets: allWallets.map(w => ({
      address: w.address,
      isPrimary: w.isPrimary,
      addedAt: w.addedAt,
      score: scoreByAddress.get(w.address) ?? 0,
    })),
    combinedScore,
  });
}

// ─── POST /api/profile ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: {
    profileId: string;
    address: string;
    signature: string;
    message: string;
    displayName?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { profileId, address, signature, message, displayName } = body;

  if (!profileId || !address || !signature || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  // 1. Timestamp check — reject if > 5 min old
  const timestamp = parseTimestampFromMessage(message);
  if (!timestamp) {
    return NextResponse.json({ error: 'Cannot parse timestamp from message' }, { status: 400 });
  }
  if (Date.now() - timestamp.getTime() > SIG_WINDOW_MS) {
    return NextResponse.json({ error: 'Signature expired — please re-sign' }, { status: 400 });
  }

  // 2. Signature verification
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

  // 3. Check address not already in any profile
  const existing = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.address, normalizedAddress));

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Address already linked to a profile' }, { status: 409 });
  }

  const now = Math.floor(Date.now() / 1000);

  // 4. Insert profile + primary wallet (transaction)
  await db.insert(userProfiles).values({
    id: profileId,
    primaryAddress: normalizedAddress,
    displayName: displayName ?? null,
    createdAt: now,
  });

  await db.insert(profileWallets).values({
    profileId,
    address: normalizedAddress,
    isPrimary: true,
    signature,
    message,
    addedAt: now,
  });

  return NextResponse.json({
    profile: {
      id: profileId,
      primaryAddress: normalizedAddress,
      displayName: displayName ?? null,
      createdAt: now,
    },
    wallets: [
      {
        address: normalizedAddress,
        isPrimary: true,
        addedAt: now,
        score: 0,
      },
    ],
    combinedScore: 0,
  }, { status: 201 });
}
