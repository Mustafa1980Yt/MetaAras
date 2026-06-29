import Link from 'next/link';
import { Wallet, Layers, Vote, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Wallet,
    color: '#6366f1',
    title: 'Connect Your Wallet',
    description:
      'Connect MetaMask, WalletConnect, or any EVM-compatible wallet. Supports Ethereum and BNB Smart Chain. No account registration needed.',
    cta: { label: 'Launch App', href: '/dashboard' },
  },
  {
    number: '02',
    icon: Layers,
    color: '#22d3ee',
    title: 'Choose a Staking Tier',
    description:
      'Pick from Bronze (30d / 8% APY) to Platinum (365d / 40% APY). Each position is independently tracked — no pool dilution, no hidden fees.',
    cta: { label: 'View Tiers', href: '/staking' },
  },
  {
    number: '03',
    icon: Vote,
    color: '#a78bfa',
    title: 'Govern the Protocol',
    description:
      'MTA token holders vote on parameter changes, treasury allocations, and protocol upgrades. Every vote is recorded immutably on-chain via a 48-hour Timelock.',
    cta: { label: 'Governance', href: '/governance' },
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 bg-[var(--surface-0)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-accent-400 uppercase tracking-widest mb-3">
            Getting Started
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            How <span className="gradient-text">MetaAras</span> Works
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Three steps to participate in a fully on-chain, transparent DeFi protocol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-16 left-1/3 w-1/3 h-px bg-gradient-to-r from-brand-500/40 to-accent-500/40" />
          <div className="hidden md:block absolute top-16 left-2/3 w-1/3 h-px bg-gradient-to-r from-accent-500/40 to-purple-500/40" />

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-7 hover:border-brand-500/40 transition-all group"
            >
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `${step.color}18` }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <span
                  className="text-5xl font-black leading-none opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ color: step.color }}
                >
                  {step.number}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">{step.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                {step.description}
              </p>

              <Link
                href={step.cta.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: step.color }}
              >
                {step.cta.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
