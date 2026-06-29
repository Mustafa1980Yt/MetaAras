import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

const TIERS = [
  {
    name: 'Bronze',
    lockDays: 30,
    apy: '8%',
    minAmount: '100 MTA',
    color: '#cd7f32',
    gradient: 'from-amber-700/20 to-amber-600/5',
    borderHover: 'hover:border-amber-600/60',
    popular: false,
  },
  {
    name: 'Silver',
    lockDays: 90,
    apy: '15%',
    minAmount: '1,000 MTA',
    color: '#9ca3af',
    gradient: 'from-gray-400/20 to-gray-300/5',
    borderHover: 'hover:border-gray-400/60',
    popular: false,
  },
  {
    name: 'Gold',
    lockDays: 180,
    apy: '25%',
    minAmount: '5,000 MTA',
    color: '#eab308',
    gradient: 'from-yellow-500/20 to-yellow-400/5',
    borderHover: 'hover:border-yellow-500/60',
    popular: true,
  },
  {
    name: 'Platinum',
    lockDays: 365,
    apy: '40%',
    minAmount: '10,000 MTA',
    color: '#6366f1',
    gradient: 'from-brand-500/20 to-brand-400/5',
    borderHover: 'hover:border-brand-500/60',
    popular: false,
  },
];

export function StakingTiersSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3">
            Tiered Staking
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Earn Up to <span className="gradient-text">40% APY</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Fixed-rate rewards with no pool dilution. Each staking position is independently tracked on-chain.
            Early exit incurs a 20% penalty on principal — rewards are always paid in full.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border bg-gradient-to-b ${tier.gradient} border-[var(--border)] ${tier.borderHover} p-6 transition-all group`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black">
                  Most Popular
                </div>
              )}

              <div className="mb-5">
                <div
                  className="text-2xl font-black mb-1"
                  style={{ color: tier.color }}
                >
                  {tier.name}
                </div>
                <div className="text-4xl font-extrabold text-[var(--text-primary)]">
                  {tier.apy}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Annual Percentage Yield</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Lock Period
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{tier.lockDays} days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Minimum</span>
                  <span className="font-semibold text-[var(--text-primary)]">{tier.minAmount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Early Exit</span>
                  <span className="font-semibold text-red-400">20% penalty</span>
                </div>
              </div>

              <Link
                href="/staking"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold border transition-all"
                style={{
                  borderColor: `${tier.color}40`,
                  color: tier.color,
                }}
              >
                Stake Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-8">
          Rewards are funded from the Ecosystem allocation (35M MTA). No inflationary minting.
          All parameters are governed on-chain.
        </p>
      </div>
    </section>
  );
}
