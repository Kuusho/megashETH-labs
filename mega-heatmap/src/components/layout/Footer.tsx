import Link from "next/link";
import { Github, Twitter } from "lucide-react";

const productLinks = [
  { name: "Transaction Heatmap", href: "/heatmap" },
  { name: "Points Dashboard", href: "/dashboard" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Deployments", href: "/deployments" },
];

const resourceLinks = [
  { name: "MegaETH", href: "https://megaeth.com", external: true },
];

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com/megasheth", icon: Twitter },
  { name: "GitHub", href: "https://github.com/megasheth", icon: Github },
];

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "rgba(174, 164, 191, 0.12)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-2 gap-8 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                style={{
                  backgroundColor: "rgba(132, 226, 150, 0.12)",
                  border: "1px solid rgba(132, 226, 150, 0.3)",
                  color: "var(--color-accent)",
                }}
              >
                BI
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Bunny Intel
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-dim)" }}>
              Onchain analytics for the MegaETH ecosystem.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-muted)" }}
            >
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-150 hover:text-[var(--color-text)]"
                    style={{ color: "var(--color-dim)" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-muted)" }}
            >
              Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    {...(link.external && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    className="text-sm transition-colors duration-150 hover:text-[var(--color-text)]"
                    style={{ color: "var(--color-dim)" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-muted)" }}
            >
              Connect
            </h3>
            <div className="flex gap-2">
              {socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="p-2 rounded-md transition-colors duration-150 hover:text-[var(--color-text)]"
                  style={{
                    color: "var(--color-dim)",
                    border: "1px solid rgba(174, 164, 191, 0.15)",
                  }}
                >
                  <link.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="py-5 border-t flex flex-col sm:flex-row justify-between items-center gap-3"
          style={{ borderColor: "rgba(174, 164, 191, 0.08)" }}
        >
          <p className="text-xs font-mono" style={{ color: "var(--color-dim)" }}>
            © 2025 Bunny Intel. Built for the MegaETH ecosystem.
          </p>
          <p className="text-xs" style={{ color: "var(--color-dim)" }}>
            Powered by{" "}
            <Link
              href="https://megaeth.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)] transition-colors duration-150"
              style={{ color: "var(--color-muted)" }}
            >
              MegaETH
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
