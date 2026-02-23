import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";

export const metadata: Metadata = {
  title: {
    default: "Bunny Intel | MegaETH Onchain Analytics",
    template: "%s | Bunny Intel",
  },
  description:
    "onchain intel for the real-time blockchain. track activity, discover alpha, compete on leaderboards. bunny speed gud. 🐰🥕",
  keywords: ["megaeth", "blockchain", "analytics", "heatmap", "onchain", "web3", "bunny intel"],
  authors: [{ name: "Pan", url: "https://twitter.com/korewapandesu" }],
  openGraph: {
    title: "Bunny Intel | MegaETH Onchain Analytics",
    description: "onchain intel for the real-time blockchain 🐰🥕",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0909",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Fonts - placeholder until you find sexier ones */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased font-sans" style={{ backgroundColor: '#0a0909' }}>
        <Providers>
          {/* Dots background (bunny style) */}
          <div className="fixed inset-0 bg-dots pointer-events-none opacity-30" />

          {/* Gradient orbs - rainbow theme */}
          <div
            className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
            style={{ backgroundColor: 'rgba(255, 107, 53, 0.08)' }}
          />
          <div
            className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
            style={{ backgroundColor: 'rgba(255, 133, 212, 0.06)' }}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
            style={{ backgroundColor: 'rgba(78, 205, 196, 0.04)' }}
          />

          {/* Main app */}
          <div className="relative flex min-h-screen flex-col">
            <HeaderWrapper />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
