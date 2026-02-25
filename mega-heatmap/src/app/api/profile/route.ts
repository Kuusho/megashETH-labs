/**
 * Profile API
 *
 * GET   /api/profile?address=0x...  → fetch profile + wallets + combinedScore
 * POST  /api/profile                → create profile (verify timestamp + sig)
 * PATCH /api/profile                → update displayName / twitter
 */

import { NextRequest, NextResponse } from 'next/server';
import { recoverMessageAddress } from 'viem';
import { db } from '@/lib/db';
import { userProfiles, profileWallets, userActivity } from '@/lib/db/schema';
import { eq, inArray, sum } from 'drizzle-orm';

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

// ─── GET /api/profile?address=0x... ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  const normalizedAddress = normalizeAddress(address);

  const walletRows = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.address, normalizedAddress));

  if (walletRows.length === 0) {
    return NextResponse.json({ error: 'No profile for this address' }, { status: 404 });
  }

  const profileId = walletRows[0].profileId;

  const profileRows = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, profileId));

  if (profileRows.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const profile = profileRows[0];

  const allWallets = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.profileId, profileId));

  const walletAddresses = allWallets.map(w => w.address);

  let combinedScore = 0;
  if (walletAddresses.length > 0) {
    const scoreResult = await db
      .select({ total: sum(userActivity.megaethNativeScore) })
      .from(userActivity)
      .where(inArray(userActivity.address, walletAddresses));
    combinedScore = Number(scoreResult[0]?.total ?? 0);
  }

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
      twitter: profile.twitter,
      avatarUrl: profile.avatarUrl,
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
    twitter?: string;
    avatarUrl?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { profileId, address, signature, message, displayName, twitter, avatarUrl } = body;

  if (!profileId || !address || !signature || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!displayName?.trim()) {
    return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  // Timestamp check
  const timestamp = parseTimestampFromMessage(message);
  if (!timestamp) {
    return NextResponse.json({ error: 'Cannot parse timestamp from message' }, { status: 400 });
  }
  if (Date.now() - timestamp.getTime() > SIG_WINDOW_MS) {
    return NextResponse.json({ error: 'Signature expired — please re-sign' }, { status: 400 });
  }

  // Signature verification
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

  const existing = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.address, normalizedAddress));

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Address already linked to a profile' }, { status: 409 });
  }

  const now = Math.floor(Date.now() / 1000);

  await db.insert(userProfiles).values({
    id: profileId,
    primaryAddress: normalizedAddress,
    displayName: displayName.trim(),
    twitter: twitter?.trim() || null,
    avatarUrl: avatarUrl?.trim() || null,
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
      displayName: displayName.trim(),
      twitter: twitter?.trim() || null,
      avatarUrl: avatarUrl?.trim() || null,
      createdAt: now,
    },
    wallets: [{ address: normalizedAddress, isPrimary: true, addedAt: now, score: 0 }],
    combinedScore: 0,
  }, { status: 201 });
}

// ─── PATCH /api/profile ───────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  let body: {
    address: string;
    displayName?: string;
    twitter?: string;
    avatarUrl?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { address, displayName, twitter, avatarUrl } = body;

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  if (displayName !== undefined && !displayName.trim()) {
    return NextResponse.json({ error: 'Display name cannot be empty' }, { status: 400 });
  }

  const normalizedAddress = normalizeAddress(address);

  // Find profile via wallet
  const walletRows = await db
    .select()
    .from(profileWallets)
    .where(eq(profileWallets.address, normalizedAddress));

  if (walletRows.length === 0) {
    return NextResponse.json({ error: 'No profile for this address' }, { status: 404 });
  }

  const profileId = walletRows[0].profileId;

  // Build update payload — only update fields that were passed
  const updates: { displayName?: string; twitter?: string | null; avatarUrl?: string | null } = {};
  if (displayName !== undefined) updates.displayName = displayName.trim();
  if (twitter !== undefined) updates.twitter = twitter.trim() || null;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl?.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  await db
    .update(userProfiles)
    .set(updates)
    .where(eq(userProfiles.id, profileId));

  const updated = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, profileId));

  return NextResponse.json({
    profile: {
      id: updated[0].id,
      primaryAddress: updated[0].primaryAddress,
      displayName: updated[0].displayName,
      twitter: updated[0].twitter,
      avatarUrl: updated[0].avatarUrl,
      createdAt: updated[0].createdAt,
    },
  });
}
