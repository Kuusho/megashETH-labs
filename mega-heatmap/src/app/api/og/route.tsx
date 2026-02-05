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
  background: '#0a0909',
  surface: '#111011',
  surfaceElevated: '#191718',
  heat: ['#1a1617', '#4a1a0a', '#8c250a', '#d43d0f', '#eb4511'],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Extract query params
  const userA = searchParams.get('userA') || '0x1234...5678';
  const userB = searchParams.get('userB') || '0xabcd...efgh';
  const winsA = parseInt(searchParams.get('winsA') || '0', 10);
  const winsB = parseInt(searchParams.get('winsB') || '0', 10);
  const streakA = parseInt(searchParams.get('streakA') || '0', 10);
  const streakB = parseInt(searchParams.get('streakB') || '0', 10);
  const txA = parseInt(searchParams.get('txA') || '0', 10);
  const txB = parseInt(searchParams.get('txB') || '0', 10);

  // Load Inter font
  const interBold = await fetch(
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf'
  ).then((res) => res.arrayBuffer());

  const interRegular = await fetch(
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf'
  ).then((res) => res.arrayBuffer());

  // Determine overall winner
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
          fontFamily: 'Inter',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(to right, ${colors.shadow}40 1px, transparent 1px), linear-gradient(to bottom, ${colors.shadow}40 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow effect behind VS */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.orange}30 0%, transparent 70%)`,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '32px',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: colors.alabaster,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: colors.orange }}>⚡</span>
            MegaETH Heatmap Battle
          </div>
        </div>

        {/* Main comparison area */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 60px',
            gap: '40px',
          }}
        >
          {/* User A */}
          <UserCard
            name={userA}
            wins={winsA}
            streak={streakA}
            txCount={txA}
            isWinner={winner === 'A'}
            side="left"
          />

          {/* VS Divider */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.saffron} 100%)`,
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              VS
            </div>
            {winner !== 'TIE' && (
              <div
                style={{
                  fontSize: '14px',
                  color: colors.orange,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                {winner === 'A' ? '← Winner' : 'Winner →'}
              </div>
            )}
          </div>

          {/* User B */}
          <UserCard
            name={userB}
            wins={winsB}
            streak={streakB}
            txCount={txB}
            isWinner={winner === 'B'}
            side="right"
          />
        </div>

        {/* Bottom heatmap decoration */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: '24px',
            gap: '3px',
          }}
        >
          <HeatmapDecoration />
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: '#878283',
            }}
          >
            megaeth.labs • Real-time On-Chain Activity
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Inter',
          data: interRegular,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}

function UserCard({
  name,
  wins,
  streak,
  txCount,
  isWinner,
  side,
}: {
  name: string;
  wins: number;
  streak: number;
  txCount: number;
  isWinner: boolean;
  side: 'left' | 'right';
}) {
  const borderColor = isWinner ? colors.orange : colors.shadow;
  const glowStyle = isWinner
    ? { boxShadow: `0 0 40px ${colors.orange}40` }
    : {};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: colors.surface,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '32px 48px',
        minWidth: '320px',
        ...glowStyle,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.saffron} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 700,
          color: colors.background,
          marginBottom: '16px',
        }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: colors.alabaster,
          marginBottom: '24px',
        }}
      >
        {name.length > 12 ? `${name.slice(0, 6)}...${name.slice(-4)}` : name}
      </div>

      {/* Wins - Big number */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: isWinner ? colors.orange : colors.alabaster,
            lineHeight: 1,
          }}
        >
          {wins}
        </div>
        <div
          style={{
            fontSize: '14px',
            color: '#878283',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Wins
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: colors.alabaster,
            }}
          >
            🔥 {streak}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#878283',
            }}
          >
            Day Streak
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: colors.alabaster,
            }}
          >
            {txCount.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#878283',
            }}
          >
            Total TXs
          </div>
        </div>
      </div>

      {/* Winner badge */}
      {isWinner && (
        <div
          style={{
            marginTop: '20px',
            background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.saffron} 100%)`,
            color: colors.background,
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 16px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          🏆 Champion
        </div>
      )}
    </div>
  );
}

function HeatmapDecoration() {
  // Generate a decorative heatmap pattern
  const cells = [];
  const pattern = [
    0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 4, 4, 3, 2,
    1, 0, 0, 1, 3, 4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 4,
  ];

  for (let i = 0; i < pattern.length; i++) {
    cells.push(
      <div
        key={i}
        style={{
          width: '16px',
          height: '16px',
          backgroundColor: colors.heat[pattern[i]],
          borderRadius: '2px',
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '3px',
        opacity: 0.8,
      }}
    >
      {cells}
    </div>
  );
}
