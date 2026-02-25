import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// MegaETH color palette
const colors = {
  orange: '#eb4511',
  saffron: '#ff9000',
  iron: '#b02e0c',
  shadow: '#312c2d',
  alabaster: '#dfdadb',
  muted: '#878283',
  background: '#0a0909',
  surface: '#111011',
  accent: '#84e296',
  heat: ['#1a1617', '#4a1a0a', '#8c250a', '#d43d0f', '#eb4511'],
};

function formatPts(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const userA = searchParams.get('userA') || '0x1234...5678';
  const userB = searchParams.get('userB') || '0xabcd...efgh';
  const winsA = parseInt(searchParams.get('winsA') || '0', 10);
  const winsB = parseInt(searchParams.get('winsB') || '0', 10);
  const streakA = parseInt(searchParams.get('streakA') || '0', 10);
  const streakB = parseInt(searchParams.get('streakB') || '0', 10);
  const txA = parseInt(searchParams.get('txA') || '0', 10);
  const txB = parseInt(searchParams.get('txB') || '0', 10);
  const ptA = parseInt(searchParams.get('ptA') || '0', 10);
  const ptB = parseInt(searchParams.get('ptB') || '0', 10);

  // Load fonts — non-fatal if CDN is unreachable on edge
  let interBold: ArrayBuffer | undefined;
  let interRegular: ArrayBuffer | undefined;
  try {
    [interBold, interRegular] = await Promise.all([
      fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf').then(r => r.arrayBuffer()),
      fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf').then(r => r.arrayBuffer()),
    ]);
  } catch {
    // Falls back to system sans-serif
  }

  const winner = winsA > winsB ? 'A' : winsB > winsA ? 'B' : 'TIE';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.background,
          fontFamily: interBold ? 'Inter' : 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `linear-gradient(to right, ${colors.shadow}40 1px, transparent 1px), linear-gradient(to bottom, ${colors.shadow}40 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Centre glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px', height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.orange}25 0%, transparent 70%)`,
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '28px', gap: '12px' }}>
          <div style={{ fontSize: '26px', fontWeight: 700, color: colors.alabaster, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.orange }}>⚡</span>
            MegaETH Heatmap Battle
          </div>
        </div>

        {/* Main comparison */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '16px 48px', gap: '32px' }}>
          <UserCard name={userA} wins={winsA} streak={streakA} txCount={txA} pts={ptA} isWinner={winner === 'A'} />

          {/* VS divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                fontSize: '60px', fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.saffron} 100%)`,
                backgroundClip: 'text', color: 'transparent',
              }}
            >
              VS
            </div>
            {winner !== 'TIE' && (
              <div style={{ fontSize: '13px', color: colors.orange, textTransform: 'uppercase', letterSpacing: '2px' }}>
                {winner === 'A' ? '← Winner' : 'Winner →'}
              </div>
            )}
            {winner === 'TIE' && (
              <div style={{ fontSize: '13px', color: colors.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>
                Tie
              </div>
            )}
          </div>

          <UserCard name={userB} wins={winsB} streak={streakB} txCount={txB} pts={ptB} isWinner={winner === 'B'} />
        </div>

        {/* Bottom heatmap decoration */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px', gap: '3px' }}>
          <HeatmapDecoration />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: colors.muted }}>
            megaeth.labs • Real-time On-Chain Activity
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        ...(interBold ? [{ name: 'Inter', data: interBold, style: 'normal' as const, weight: 700 as const }] : []),
        ...(interRegular ? [{ name: 'Inter', data: interRegular, style: 'normal' as const, weight: 400 as const }] : []),
      ],
    }
  );
}

function UserCard({
  name,
  wins,
  streak,
  txCount,
  pts,
  isWinner,
}: {
  name: string;
  wins: number;
  streak: number;
  txCount: number;
  pts: number;
  isWinner: boolean;
}) {
  const borderColor = isWinner ? colors.orange : colors.shadow;
  const glowStyle = isWinner ? { boxShadow: `0 0 40px ${colors.orange}35` } : {};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: colors.surface,
        border: `2px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '28px 44px',
        minWidth: '300px',
        ...glowStyle,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '72px', height: '72px',
          borderRadius: '50%',
          background: isWinner
            ? `linear-gradient(135deg, ${colors.orange} 0%, ${colors.saffron} 100%)`
            : `linear-gradient(135deg, #312c2d 0%, #1a1617 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: 700,
          color: isWinner ? colors.background : colors.muted,
          marginBottom: '14px',
          border: isWinner ? 'none' : `1px solid ${colors.shadow}`,
        }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>

      {/* Name */}
      <div style={{ fontSize: '18px', fontWeight: 700, color: colors.alabaster, marginBottom: '20px' }}>
        {name.length > 14 ? `${name.slice(0, 6)}...${name.slice(-4)}` : name}
      </div>

      {/* Wins — big number */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '64px', fontWeight: 700, color: isWinner ? colors.orange : colors.alabaster, lineHeight: 1 }}>
          {wins}
        </div>
        <div style={{ fontSize: '12px', color: colors.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>
          Wins
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <StatCell label="Streak" value={`🔥 ${streak}d`} />
        <StatCell label="Total TXs" value={txCount >= 1000 ? `${(txCount / 1000).toFixed(0)}K` : String(txCount)} />
        <StatCell label="Points" value={`⚡ ${formatPts(pts)}`} highlight={pts > 0} />
      </div>

      {/* Winner badge */}
      {isWinner && (
        <div
          style={{
            marginTop: '18px',
            background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.saffron} 100%)`,
            color: colors.background,
            fontSize: '11px', fontWeight: 700,
            padding: '5px 14px', borderRadius: '4px',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}
        >
          🏆 Champion
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color: highlight ? colors.accent : colors.alabaster }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: colors.muted }}>
        {label}
      </div>
    </div>
  );
}

function HeatmapDecoration() {
  const pattern = [
    0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 4, 4, 3, 2,
    1, 0, 0, 1, 3, 4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 4,
  ];

  return (
    <div style={{ display: 'flex', gap: '3px', opacity: 0.8 }}>
      {pattern.map((level, i) => (
        <div
          key={i}
          style={{ width: '16px', height: '16px', backgroundColor: colors.heat[level], borderRadius: '2px' }}
        />
      ))}
    </div>
  );
}
