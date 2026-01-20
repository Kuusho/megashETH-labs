import Link from "next/link";
import { Github, Twitter } from "lucide-react";

const links = {
  product: [
    { name: "Transaction Heatmap", href: "/heatmap" },
    { name: "Ecosystem Catalogue", href: "/catalogue" },
  ],
  resources: [
    { name: "MegaETH", href: "https://megaeth.com", external: true },
    { name: "Documentation", href: "/docs" },
  ],
  social: [
    { name: "Twitter", href: "https://twitter.com/megasheth", icon: Twitter },
    { name: "GitHub", href: "https://github.com/megasheth", icon: Github },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-mega-gray-200/50 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-mega rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="font-semibold text-mega-gray-900">
                  mega<span className="text-mega-green">SHETH</span>
                </span>
              </Link>
              <p className="mt-4 text-sm text-mega-gray-500 max-w-xs">
                Building tools for the MegaETH ecosystem. Showcasing real-time
                performance and driving adoption.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-mega-gray-900">Product</h3>
              <ul className="mt-4 space-y-3">
                {links.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-mega-gray-500 hover:text-mega-green transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-semibold text-mega-gray-900">Resources</h3>
              <ul className="mt-4 space-y-3">
                {links.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      {...(link.external && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                      className="text-sm text-mega-gray-500 hover:text-mega-green transition-colors"
                    >
                      {link.name}
                      {link.external && (
                        <span className="ml-1 text-mega-gray-400">{"}"}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-sm font-semibold text-mega-gray-900">Connect</h3>
              <div className="mt-4 flex gap-4">
                {links.social.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mega-gray-400 hover:text-mega-green transition-colors"
                    aria-label={link.name}
                  >
                    <link.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-mega-gray-200/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-mega-gray-400">
                2025 megaSHETH Labs. Built for the MegaETH ecosystem.
              </p>
              <p className="text-xs text-mega-gray-400">
                Powered by{" "}
                <Link
                  href="https://megaeth.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mega-green hover:underline underline-offset-4"
                >
                  MegaETH
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
