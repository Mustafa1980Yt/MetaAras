import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Zap, Shield, Vote, Lock, BarChart3, Globe, ArrowRight, FileText,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Litepaper',
  description: 'MetaAras (MTA) protocol summary — governance, staking, vesting, and multichain architecture in one page.',
};

const PILLARS = [
  {
    icon: Zap,
    color: '#6366f1',
    title: 'MTA Token',
    points: [
      'Fixed supply: 100,000,000 MTA — no inflation',
      'ERC-20 + EIP-2612 Permit + EIP-5805 Votes',
      'On-chain blacklist and emergency pause',
      'Minting permanently disabled after distribution',
    ],
  },
  {
    icon: Lock,
    color: '#a78bfa',
    title: 'Vesting',
    points: [
      'Team: 15M MTA — 12m cliff + 36m linear',
      'Seed: 10M MTA — 6m cliff + 18m linear',
      'Per-second accrual, no rounding errors',
      'Admin-revocable: unvested returns to treasury',
    ],
  },
  {
    icon: BarChart3,
    color: '#fb923c',
    title: 'Staking',
    points: [
      'Four APY tiers: 8% / 15% / 25% / 40%',
      'Lock periods: 30 / 90 / 180 / 365 days',
      'Per-position reward isolation — no dilution',
      'Early exit: 20% principal penalty, rewards paid in full',
    ],
  },
  {
    icon: Vote,
    color: '#34d399',
    title: 'Governance',
    points: [
      'OpenZeppelin Governor v5 + TimelockController',
      'Proposal threshold: 500K MTA (0.5%)',
      '7-day voting period, 4% quorum required',
      '48-hour timelock delay before execution',
    ],
  },
  {
    icon: Globe,
    color: '#22d3ee',
    title: 'Multichain',
    points: [
      'Native deployment on Ethereum + BNB Chain',
      'Identical contract bytecode on both chains',
      'Frontend auto-detects chain, routes contracts',
      'Wrong network → one-click switch prompt',
    ],
  },
  {
    icon: Shield,
    color: '#4ade80',
    title: 'Security',
    points: [
      '97/97 unit tests, 100% branch coverage',
      'Slither static analysis — no high findings',
      'OpenZeppelin v5 + Solidity 0.8.24',
      'External audit pre-mainnet (Q2 2026)',
    ],
  },
];

const TOKENOMICS = [
  { label: 'Ecosystem Fund', pct: 35, color: '#6366f1', note: 'Staking rewards, grants, partnerships' },
  { label: 'Liquidity',      pct: 20, color: '#22d3ee', note: 'DEX liquidity provision' },
  { label: 'Treasury',       pct: 15, color: '#34d399', note: 'DAO-controlled via governance' },
  { label: 'Team',           pct: 15, color: '#a78bfa', note: '12m cliff + 36m vesting' },
  { label: 'Seed Round',     pct: 10, color: '#fb923c', note: '6m cliff + 18m vesting' },
  { label: 'Public Sale',    pct:  5, color: '#f472b6', note: 'No lockup at TGE' },
];

const TIMELINE = [
  { q: 'Q4 2025', label: 'Foundation', done: true,  note: 'Contracts, 97 tests, internal audit' },
  { q: 'Q1 2026', label: 'Frontend',   done: true,  note: 'Next.js DApp, wagmi, multichain' },
  { q: 'Q2 2026', label: 'Testnet',    done: false, note: 'Sepolia + BSC Testnet deploy' },
  { q: 'Q3 2026', label: 'Audit',      done: false, note: 'External audit + bug bounty' },
  { q: 'Q4 2026', label: 'Mainnet',    done: false, note: 'Ethereum + BSC launch' },
  { q: '2027+',   label: 'Ecosystem',  done: false, note: 'L2, grants, SDK, mobile' },
];

export default function LitepaperPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Executive Summary</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          MetaAras <span className="gradient-text">Litepaper</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
          A concise overview of the MetaAras (MTA) protocol — token architecture,
          staking economics, governance model, and multichain roadmap.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Badge variant="success" dot>v1.0</Badge>
          <Badge variant="brand">Multichain</Badge>
          <Badge variant="default">June 2026</Badge>
        </div>
      </div>

      {/* What is MetaAras */}
      <Card className="mb-8 p-6" glow>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What is MetaAras?</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
          MetaAras (MTA) is a production-ready, multichain DeFi governance protocol. It provides a
          complete primitive stack — governance token, tiered staking, linear vesting, and on-chain
          DAO — deployed natively on both <strong className="text-[var(--text-primary)]">Ethereum</strong> and{' '}
          <strong className="text-[var(--text-primary)]">BNB Smart Chain</strong>.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Unlike single-chain protocols, MetaAras users can participate in staking and governance on
          whichever chain they prefer. The DApp automatically detects the connected wallet&apos;s
          network and routes to the correct contract set — no manual configuration required.
        </p>
      </Card>

      {/* Six pillars */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Protocol Pillars</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {PILLARS.map((p) => (
          <Card key={p.title} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${p.color}20` }}>
                <p.icon className="w-4 h-4" style={{ color: p.color }} />
              </div>
              <h3 className="font-bold text-[var(--text-primary)]">{p.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {p.points.map((pt) => (
                <li key={pt} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: p.color }} />
                  {pt}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Tokenomics */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Token Distribution</h2>
      <Card className="mb-12 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Total Supply: 100,000,000 MTA — Fixed</p>
          <Badge variant="success">No Inflation</Badge>
        </div>
        <div className="space-y-3">
          {TOKENOMICS.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{t.label}</span>
                  <span className="text-sm font-bold" style={{ color: t.color }}>{t.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.pct * 2.85}%`, background: t.color }} />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Roadmap</h2>
      <Card className="mb-12 p-6">
        <div className="space-y-4">
          {TIMELINE.map((t, i) => (
            <div key={t.q} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${t.done ? 'bg-green-400' : 'bg-[var(--surface-3)]'}`} />
                {i < TIMELINE.length - 1 && (
                  <div className="w-px flex-1 min-h-[20px] mt-1 bg-[var(--border)]" />
                )}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-[var(--text-muted)]">{t.q}</span>
                  <Badge variant={t.done ? 'success' : 'default'} className="text-xs">
                    {t.done ? '✓' : '○'} {t.label}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{t.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/whitepaper">
          <Card className="p-5 hover:border-brand-500/40 transition-colors cursor-pointer h-full">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <span className="font-semibold text-[var(--text-primary)]">Full Whitepaper</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Complete technical specification with contract architecture, security model, and economic design.</p>
          </Card>
        </Link>
        <Link href="/docs">
          <Card className="p-5 hover:border-brand-500/40 transition-colors cursor-pointer h-full">
            <div className="flex items-center gap-3 mb-2">
              <ArrowRight className="w-5 h-5 text-brand-400" />
              <span className="font-semibold text-[var(--text-primary)]">Developer Docs</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Integration guides, contract references, deployment pipeline, and multichain setup.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
