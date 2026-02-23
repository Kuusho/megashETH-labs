"use client";

import dynamic from "next/dynamic";

// Dynamically import Header with SSR disabled to avoid wagmi/localStorage issues
const Header = dynamic(
  () => import("@/components/layout/Header").then((mod) => mod.Header),
  {
    ssr: false,
    loading: () => <HeaderSkeleton />,
  }
);

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className="absolute inset-0 backdrop-blur-xl border-b-2"
        style={{
          backgroundColor: 'rgba(10, 9, 9, 0.9)',
          borderColor: '#ff6b35',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, #ff6b35 0%, #ff85d4 25%, #4ecdc4 50%, #ffe66d 75%, #06ffa5 100%)',
          }}
        />
      </div>
      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="w-24 h-5 rounded bg-zinc-800 animate-pulse" />
              <div className="w-32 h-3 rounded bg-zinc-800/50 animate-pulse" />
            </div>
          </div>
          
          {/* Nav skeleton */}
          <div className="hidden md:flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-8 rounded-lg bg-zinc-800/50 animate-pulse" />
            ))}
          </div>
          
          {/* Connect button skeleton */}
          <div className="w-32 h-10 rounded-xl bg-zinc-800 animate-pulse" />
        </div>
      </nav>
    </header>
  );
}

export function HeaderWrapper() {
  return <Header />;
}
