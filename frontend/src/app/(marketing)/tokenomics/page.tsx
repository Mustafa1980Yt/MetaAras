import type { Metadata } from 'next';
import { TokenomicsChart } from '@/components/charts/TokenomicsChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ALLOCATIONS, STAKING_TIERS, MAX_SUPPLY } from '@/constants/tokenomics';
import { formatNumber } from '@/utils/format';

export const metadata: Metadata = {
  title: 'Tokenomics',
  description: 'MTA token distribution, staking tiers (8–40% APY), governance parameters, and vesting schedules for the MetaAras protocol.',
};

export default function TokenomicsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Token Distribution</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          MTA <span className="gradient-text">Tokenomics</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
          Fixed supply of 100,000,000 MTA — distributed across six allocations with
          transparent, on-chain vesting schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
            <span className="text-sm text-[var(--text-muted)]">Total: {formatNumber(MAX_SUPPLY)} MTA</span>
          </CardHeader>
          <CardContent>
            <TokenomicsChart />
          </CardContent>
        </Card>

        {/* Allocation table */}
        <Card>
          <CardHeader><CardTitle>Allocation Details</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ALLOCATIONS.map(a => (
                <div key={a.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: a.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{a.label}</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{a.pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${a.pct * 2.85}%`, background: a.color }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-[var(--text-muted)]">{formatNumber(a.amount)} MTA</span>
                      <span className="text-xs text-[var(--text-muted)]">{a.vesting}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staking Tiers */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Staking Tiers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAKING_TIERS.map(tier => (
          <Card key={tier.name} glow className="text-center">
            <div
              className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
              style={{ background: `${tier.color}20` }}
            >
              {tier.name === 'Bronze' ? '🥉' : tier.name === 'Silver' ? '🥈' : tier.name === 'Gold' ? '🥇' : '💎'}
            </div>
            <h3 className="font-bold text-[var(--text-primary)]">{tier.name}</h3>
            <p className="text-3xl font-extrabold mt-1" style={{ color: tier.color }}>{tier.apy}%</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">APY</p>
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1 text-sm text-[var(--text-secondary)]">
              <p>Lock: {tier.lockDays} days</p>
              <p>Min: {formatNumber(tier.minAmount)} MTA</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Key metrics */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Early Exit Penalty', value: '20% principal', desc: 'Rewards paid in full on exit' },
          { label: 'Proposal Threshold',  value: '500K MTA', desc: '0.5% of total supply' },
          { label: 'Governance Quorum',   value: '4%', desc: '4,000,000 MTA required' },
        ].map(m => (
          <Card key={m.label} className="text-center">
            <p className="text-3xl font-extrabold gradient-text">{m.value}</p>
            <p className="font-semibold text-[var(--text-primary)] mt-1">{m.label}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{m.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
