import Link from 'next/link';
import { ArrowRight, Zap, BookOpen } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-accent-500/5 to-transparent p-12 sm:p-16 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Live on Ethereum Sepolia
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-5 leading-tight">
              Start Earning with
              <br />
              <span className="gradient-text">MetaAras Today</span>
            </h2>

            <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-10 text-lg leading-relaxed">
              Join the on-chain governance revolution. Stake MTA, vote on proposals,
              and earn up to 40% APY — fully transparent, fully decentralized.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/staking"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-bold hover:opacity-90 transition-opacity text-base"
              >
                Start Staking <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/whitepaper"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-semibold hover:bg-[var(--surface-2)] transition-colors text-base"
              >
                <BookOpen className="w-4 h-4" />
                Read Whitepaper
              </Link>
            </div>

            <p className="mt-8 text-xs text-[var(--text-muted)]">
              Open-source · MIT License · No admin keys · Governed by MTA holders
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
