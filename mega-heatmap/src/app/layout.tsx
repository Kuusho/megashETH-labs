import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { Footer } from "@/components/layout/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bunny Intel | MegaETH Onchain Analytics",
    template: "%s | Bunny Intel",
  },
  description:
    "Onchain analytics for the real-time blockchain. Track activity, discover alpha, compete on leaderboards.",
  keywords: ["megaeth", "blockchain", "analytics", "heatmap", "onchain", "web3"],
  authors: [{ name: "Pan", url: "https://twitter.com/korewapandesu" }],
  openGraph: {
    title: "Bunny Intel | MegaETH Onchain Analytics",
    description: "Onchain analytics for the real-time blockchain.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b252c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body
        className="min-h-screen antialiased font-sans"
        style={{ backgroundColor: "#3b252c" }}
      >
        <Providers>
          {/* Subtle grid texture */}
          <div className="fixed inset-0 bg-grid pointer-events-none" />

          {/* Main app */}
          <div className="relative flex min-h-screen flex-col">
            <HeaderWrapper />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
