import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'MetaAras development roadmap 2025-2028 — from smart contract foundation to multichain ecosystem with L2 support.',
};

const PHASES = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    status: 'completed' as const,
    period: 'Q4 2025',
    items: [
      'MTA ERC-20 token with ERC20Permit + ERC20Votes',
      'Linear vesting contract with cliff support',
      'UUPS upgradeable staking with 4-tier APY system',
      'On-chain Governor + 48h Timelock',
      '97/97 test coverage, Solhint clean',
      'Production Readiness Report: 76/100',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Frontend & Dashboard',
    status: 'in-progress' as const,
    period: 'Q1 2026',
    items: [
      'Next.js 16 App Router DApp',
      'RainbowKit wallet integration',
      'Staking, vesting, governance UI',
      'Real-time blockchain data via wagmi',
      'Dark/light mode, WCAG compliant',
      'Full mobile responsive design',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Security & Audit',
    status: 'upcoming' as const,
    period: 'Q2 2026',
    items: [
      'Certik / Trail of Bits external audit',
      'Immunefi bug bounty ($50K+ pool)',
      'Gnosis Safe 3/5 multisig deployment',
      'Timelock role handover',
      'Mainnet fork integration tests',
      'Foundry fuzz testing (100K+ runs)',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Mainnet Launch',
    status: 'upcoming' as const,
    period: 'Q3 2026',
    items: [
      'Ethereum mainnet deployment',
      'CoinGecko / CMC listing',
      'Liquidity provision & DEX listing',
      'The Graph subgraph indexing',
      'DAO governance activation',
      'Public staking launch',
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Ecosystem Growth',
    status: 'upcoming' as const,
    period: 'Q4 2026',
    items: [
      'BSC native deployment (matching Ethereum)',
      'The Graph subgraph — Ethereum + BSC',
      'Ecosystem grants program (DAO-funded)',
      'Developer SDK & TypeScript API client',
      'CoinGecko / CMC token listing',
      'Community ambassador program',
    ],
  },
  {
    phase: 'Phase 6',
    title: 'Layer 2 & Cross-Chain',
    status: 'upcoming' as const,
    period: 'Q1–Q2 2027',
    items: [
      'Arbitrum One deployment',
      'Base (Coinbase L2) deployment',
      'Cross-chain message bridge (LayerZero / Wormhole)',
      'Unified governance across chains',
      'L2 staking with sub-cent gas costs',
      'Portfolio bridge UI (one-click chain migration)',
    ],
  },
  {
    phase: 'Phase 7',
    title: 'Ecosystem Maturity',
    status: 'upcoming' as const,
    period: 'Q3 2027–2028',
    items: [
      'Mobile app — iOS & Android (React Native)',
      'Enterprise partnership integrations',
      'Institutional staking API (REST + WebSocket)',
      'Protocol revenue sharing via governance',
      'DAO treasury diversification strategy',
      'zkEVM deployment research',
    ],
  },
];

const statusConfig = {
  completed:   { label: 'Completed',   variant: 'success' as const, Icon: CheckCircle, color: '#34d399' },
  'in-progress': { label: 'In Progress', variant: 'brand'   as const, Icon: Clock,        color: '#6366f1' },
  upcoming:    { label: 'Upcoming',    variant: 'default'  as const, Icon: Circle,       color: '#6b7280' },
};

export default function RoadmapPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <Badge variant="brand" className="mb-4">Project Timeline</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Development <span className="gradient-text">Roadmap</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
          A transparent, milestone-driven path from smart contract foundation to full ecosystem launch.
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border)] hidden md:block" />

        <div className="space-y-8">
          {PHASES.map((phase) => {
            const cfg = statusConfig[phase.status];
            return (
              <div key={phase.phase} className="relative md:pl-16">
                {/* Timeline dot */}
                <div
                  className="absolute left-3.5 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-[var(--surface-0)] hidden md:flex items-center justify-center"
                  style={{ background: cfg.color }}
                />

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 hover:border-brand-500/40 transition-colors">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge variant="accent" className="text-xs">{phase.phase}</Badge>
                    <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                    <span className="text-xs text-[var(--text-muted)] ml-auto">{phase.period}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{phase.title}</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {phase.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <cfg.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: cfg.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
