import Link from 'next/link';
import { Zap, GitFork, ExternalLink, MessageCircle } from 'lucide-react';

const LINKS = {
  Product: [
    { label: 'Tokenomics', href: '/tokenomics' },
    { label: 'Roadmap',    href: '/roadmap' },
    { label: 'Litepaper',  href: '/litepaper' },
    { label: 'Whitepaper', href: '/whitepaper' },
    { label: 'Docs',       href: '/docs' },
  ],
  App: [
    { label: 'Dashboard',  href: '/dashboard' },
    { label: 'Staking',    href: '/staking' },
    { label: 'Vesting',    href: '/vesting' },
    { label: 'Governance', href: '/governance' },
  ],
  Legal: [
    { label: 'FAQ',              href: '/faq' },
    { label: 'Risk Disclosure',  href: '/risk' },
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const SOCIAL = [
  { label: 'GitHub',   href: 'https://github.com', icon: GitFork },
  { label: 'Twitter',  href: 'https://twitter.com', icon: ExternalLink },
  { label: 'Telegram', href: 'https://t.me', icon: MessageCircle },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-0)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--text-primary)]">
                Meta<span className="gradient-text">Aras</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
              Professional-grade Web3 protocol featuring on-chain governance,
              tiered staking, and transparent token vesting.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-brand-500/50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{group}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} MetaAras. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            OpenZeppelin v5 · Ethereum + BNB Chain
          </p>
        </div>
      </div>
    </footer>
  );
}
