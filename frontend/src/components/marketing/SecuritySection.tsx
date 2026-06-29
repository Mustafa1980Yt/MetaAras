import { Shield, Lock, CheckCircle, AlertTriangle, Code2, GitBranch } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    color: '#34d399',
    title: 'OpenZeppelin v5',
    desc: 'Built on the most-audited smart contract library in Ethereum. ERC-20, Governor, and Timelock implementations are battle-tested across hundreds of protocols.',
  },
  {
    icon: Lock,
    color: '#6366f1',
    title: 'UUPS Upgradeable Proxy',
    desc: 'MTAStaking uses EIP-1967 transparent proxies with upgrade authority locked behind governance. No single admin can upgrade without DAO approval.',
  },
  {
    icon: Code2,
    color: '#22d3ee',
    title: '97/97 Unit Tests',
    desc: 'Full test coverage across all contracts. Deterministic tests with no flakiness. Solhint static analysis passes with zero warnings.',
  },
  {
    icon: AlertTriangle,
    color: '#f59e0b',
    title: 'Reentrancy Guards',
    desc: 'All state-mutating functions in MTAStaking are protected by OpenZeppelin ReentrancyGuard. CEI pattern enforced throughout.',
  },
  {
    icon: GitBranch,
    color: '#a78bfa',
    title: '48h Timelock',
    desc: 'All governance executions queue in a 48-hour Timelock. Users and auditors have time to review and exit before any upgrade takes effect.',
  },
  {
    icon: CheckCircle,
    color: '#34d399',
    title: 'Access Control',
    desc: 'Role-based permissions with DEFAULT_ADMIN, MINTER, PAUSER, and BLACKLISTER roles. Minting is permanently revoked post-distribution.',
  },
];

export function SecuritySection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[#34d399] uppercase tracking-widest mb-3">
            Security First
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Production-Grade <span className="gradient-text">Security Architecture</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Every line of code is written with security as the top priority.
            External audit is planned for Q2 2026 before mainnet launch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 hover:border-[var(--brand-500-40,#6366f140)] transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${f.color}18` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Audit banner */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--text-primary)] text-sm">External Audit Planned — Q2 2026</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              A third-party security audit (Trail of Bits / Certik) is scheduled before mainnet deployment.
              An Immunefi bug bounty ($50K+ pool) will launch alongside the audit.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-semibold flex-shrink-0">
            Upcoming
          </span>
        </div>
      </div>
    </section>
  );
}
