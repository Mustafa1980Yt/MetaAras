import Link from 'next/link';
import { Vote, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const PARAMS = [
  { label: 'Proposal Threshold', value: '500K MTA', desc: '0.5% of supply to propose' },
  { label: 'Voting Delay', value: '24 hours', desc: '1 day after proposal creation' },
  { label: 'Voting Period', value: '7 days', desc: 'Community voting window' },
  { label: 'Quorum Required', value: '4%', desc: '4M MTA minimum participation' },
  { label: 'Timelock Delay', value: '48 hours', desc: 'Execution buffer for security' },
  { label: 'Execution', value: 'Open', desc: 'Any address can execute passed proposals' },
];

const FLOW = [
  { icon: Vote,       color: '#6366f1', title: 'Create Proposal',    desc: 'Hold 500K+ MTA to submit governance proposals on-chain.' },
  { icon: Clock,      color: '#22d3ee', title: '7-Day Voting',       desc: 'Token holders vote FOR, AGAINST, or ABSTAIN. ERC20Votes checkpointing prevents double-voting.' },
  { icon: CheckCircle,color: '#34d399', title: 'Timelock Execution', desc: 'Passed proposals queue in a 48h Timelock before execution, giving users time to react.' },
];

export function GovernanceSection() {
  return (
    <section className="py-24 px-4 bg-[var(--surface-0)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <p className="text-sm font-semibold text-accent-400 uppercase tracking-widest mb-3">
              On-Chain Governance
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-5">
              The Protocol is Owned
              <br />
              by <span className="gradient-text">Token Holders</span>
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
              MetaAras uses OpenZeppelin Governor v5 — the same battle-tested framework
              as Uniswap, Compound, and Aave. Every parameter change, treasury transfer,
              or contract upgrade goes through a binding on-chain vote.
            </p>

            <div className="space-y-5 mb-8">
              {FLOW.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${f.color}18` }}
                  >
                    <f.icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-sm">{f.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/governance"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
            >
              Open Governance <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PARAMS.map((p) => (
              <div
                key={p.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 hover:border-brand-500/30 transition-colors"
              >
                <p className="text-xs text-[var(--text-muted)] mb-1">{p.label}</p>
                <p className="text-xl font-bold text-[var(--text-primary)] mb-0.5">{p.value}</p>
                <p className="text-xs text-[var(--text-secondary)]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
