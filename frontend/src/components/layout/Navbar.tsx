'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { label: 'Tokenomics', href: '/tokenomics' },
  { label: 'Roadmap',    href: '/roadmap' },
  { label: 'Litepaper',  href: '/litepaper' },
  { label: 'Whitepaper', href: '/whitepaper' },
  { label: 'Docs',       href: '/docs' },
] as const;

const DAPP_LINKS = [
  { label: 'Dashboard',  href: '/dashboard' },
  { label: 'Staking',    href: '/staking' },
  { label: 'Vesting',    href: '/vesting' },
  { label: 'Governance', href: '/governance' },
  { label: 'Treasury',   href: '/treasury' },
  { label: 'Analytics',  href: '/analytics' },
  { label: 'Admin',      href: '/admin' },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDapp = DAPP_LINKS.some(l => pathname.startsWith(l.href));

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'glass border-b border-[var(--border)] shadow-lg shadow-black/10'
          : 'bg-transparent',
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
            Meta<span className="gradient-text">Aras</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden xl:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]',
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="w-px h-5 bg-[var(--border)] mx-1" />
          {DAPP_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Wallet connect */}
          <div className="hidden sm:block">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus="avatar"
            />
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="xl:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden glass border-b border-[var(--border)] px-4 pb-4 space-y-1">
          {[...NAV_LINKS, ...DAPP_LINKS].map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]',
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>
        </div>
      )}
    </header>
  );
}
