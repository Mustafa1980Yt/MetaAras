'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const STATS = [
  { label: 'Max Supply',     value: '100M MTA' },
  { label: 'Max Staking APY', value: '40%' },
  { label: 'Gov. Threshold', value: '500K MTA' },
  { label: 'Timelock Delay', value: '48h' },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Battle-Tested Security',
    desc: 'OpenZeppelin v5 standards, Slither-analyzed, 97/97 unit tests, Solidity 0.8.24.',
    color: '#22d3ee',
  },
  {
    icon: Zap,
    title: 'Tiered Staking',
    desc: 'Four APY tiers from 8% to 40% with per-position reward tracking.',
    color: '#6366f1',
  },
  {
    icon: BarChart3,
    title: 'On-Chain Governance',
    desc: 'Full DAO with 48h Timelock, 4% quorum, and Governor voting contracts.',
    color: '#a78bfa',
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="brand" dot className="mb-6 text-sm px-4 py-1">
            Multichain DeFi Protocol — Ethereum + BNB Chain
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
        >
          <span className="text-[var(--text-primary)]">The Future of</span>
          <br />
          <span className="gradient-text">Web3 Governance</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          MetaAras (MTA) combines tiered staking, linear vesting, and on-chain DAO governance
          in a fully audited, upgradeable smart contract suite on Ethereum.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/staking">
            <Button size="lg">
              Start Staking <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/tokenomics">
            <Button variant="outline" size="lg">View Tokenomics</Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          {STATS.map(stat => (
            <div
              key={stat.label}
              className="glass rounded-2xl px-4 py-3 text-center"
            >
              <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            className="glass rounded-2xl p-6 border border-[var(--border)] hover:border-brand-500/40 transition-colors group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${f.color}20` }}
            >
              <f.icon className="w-5 h-5" style={{ color: f.color }} />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
