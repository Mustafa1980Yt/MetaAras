import { TrendingUp, Users, Shield, Zap } from 'lucide-react';

const STATS = [
  {
    icon: TrendingUp,
    label: 'Max Staking APY',
    value: '40%',
    sub: 'Platinum tier · 365-day lock',
    color: '#34d399',
  },
  {
    icon: Zap,
    label: 'Total Supply',
    value: '100M',
    sub: 'MTA · Hard-capped, no inflation',
    color: '#6366f1',
  },
  {
    icon: Shield,
    label: 'Unit Tests',
    value: '97/97',
    sub: 'Passing · Solhint clean',
    color: '#22d3ee',
  },
  {
    icon: Users,
    label: 'Timelock Delay',
    value: '48h',
    sub: 'Governance execution buffer',
    color: '#a78bfa',
  },
];

export function ProtocolStatsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3">
            Protocol Metrics
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Built for <span className="gradient-text">Institutional Grade</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Every parameter in MetaAras is governed on-chain. No admin keys. No hidden inflation. Full transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="glass rounded-2xl p-6 border border-[var(--border)] hover:border-brand-500/40 transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${s.color}18` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-3xl font-extrabold text-[var(--text-primary)] mb-1">{s.value}</p>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{s.label}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
