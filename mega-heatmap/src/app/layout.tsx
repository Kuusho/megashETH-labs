import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: {
    default: "megaSHETH Labs | MegaETH Ecosystem Tools",
    template: "%s | megaSHETH Labs",
  },
  description:
    "Building tools for the MegaETH ecosystem. Transaction Heatmap, Ecosystem Catalogue, and more.",
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
          {/* Grid background */}
          <div className="fixed inset-0 bg-grid pointer-events-none" />

          {/* Gradient orbs - fire theme */}
          <div
            className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
            style={{ backgroundColor: 'rgba(235, 69, 17, 0.06)' }}
          />
          <div
            className="fixed bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
            style={{ backgroundColor: 'rgba(255, 144, 0, 0.04)' }}
          />

          {/* Main app */}
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
