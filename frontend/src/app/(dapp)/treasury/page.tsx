import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Shield, Vault, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'Treasury' };

const ALLOCATIONS = [
  { label: 'Ecosystem Fund',   amount: '35,000,000', pct: 35, status: 'DAO-governed',     color: '#6366f1' },
  { label: 'Liquidity Pool',   amount: '20,000,000', pct: 20, status: 'Deployed',          color: '#22d3ee' },
  { label: 'Treasury Reserve', amount: '15,000,000', pct: 15, status: 'Timelock-locked',   color: '#34d399' },
  { label: 'Public Sale',      amount: '5,000,000',  pct:  5, status: 'Released at TGE',   color: '#f472b6' },
];

const RECENT_TXS = [
  { type: 'out', label: 'Liquidity Provision',  amount: '-20,000,000 MTA', date: 'Jan 15, 2026', status: 'Executed' },
  { type: 'in',  label: 'Early Exit Penalties',  amount: '+12,450 MTA',    date: 'Jun 20, 2026', status: 'Collected' },
  { type: 'out', label: 'Ecosystem Grant #1',    amount: '-100,000 MTA',   date: 'Jun 01, 2026', status: 'Pending DAO' },
];

export default function TreasuryPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Treasury</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          MetaAras DAO treasury · Governed by MTA token holders
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Treasury',    value: '100M MTA', icon: Vault,  color: '#6366f1' },
          { label: 'DAO-Controlled',    value: '50M MTA',  icon: Shield, color: '#34d399' },
          { label: 'Pending Proposals', value: '1',        icon: Clock,  color: '#fb923c' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} glow className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation breakdown */}
        <Card>
          <CardHeader><CardTitle>Allocation Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {ALLOCATIONS.map(a => (
              <div key={a.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{a.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">{a.status}</Badge>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{a.pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${a.pct * 2.85}%`, background: a.color }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 text-right">{a.amount} MTA</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_TXS.map((tx, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)]">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'in' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}>
                    {tx.type === 'in'
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      : <ArrowUpRight className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{tx.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{tx.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${tx.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Governance note */}
      <Card className="mt-6">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">DAO Governance Controls Treasury</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              All treasury disbursements require a governance proposal, 4% quorum vote, and 48-hour Timelock
              execution delay. No single entity can move treasury funds unilaterally.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
