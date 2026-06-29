import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FileText, Download, Shield, Zap, Vote, Lock,
  BarChart3, Layers, GitBranch, AlertTriangle, Globe, Link2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Whitepaper',
  description: 'Technical specification and economic model of the MetaAras (MTA) protocol — v2.0',
};

const SECTIONS = [
  {
    icon: Globe,
    color: '#6366f1',
    title: '1. Introduction & Vision',
    content: `MetaAras (MTA) is a professional-grade ERC-20 governance and utility token built for multichain DeFi. \
The protocol deploys natively on Ethereum and BNB Smart Chain, delivering an identical contract stack on both networks: \
on-chain DAO governance with timelock, tiered staking with deterministic APY, linear vesting for team and investor \
allocations, and a transparent treasury managed exclusively through governance votes.

The MetaAras mission is to provide a reference implementation of a production-ready, multichain governance token system \
that any project can study, fork, or integrate — fully open-source under the MIT license.`,
  },
  {
    icon: FileText,
    color: '#22d3ee',
    title: '2. Token Architecture (MTAToken)',
    content: `MTAToken is a composable ERC-20 with four capability layers:

• ERC20Permit (EIP-2612): Gasless approvals via off-chain signatures, reducing UX friction for staking and governance interactions.
• ERC20Votes (EIP-5805): Snapshot-based voting power. Delegated votes are checkpointed per block, enabling trustless historical queries.
• ERC20Burnable: Token holders can permanently reduce circulating supply.
• ERC20Pausable + AccessControl: Role-based emergency pause with four roles — DEFAULT_ADMIN, MINTER, PAUSER, BLACKLISTER.

Supply parameters: Hard cap 100,000,000 MTA. Minting is permanently disabled via revokeMinter() after initial distribution. \
No inflation mechanism exists at the protocol level.`,
  },
  {
    icon: Lock,
    color: '#a78bfa',
    title: '3. Vesting Schedule (MTAVesting)',
    content: `MTAVesting implements linear vesting with configurable cliff periods and an emergency revocation mechanism:

Team Allocation (15,000,000 MTA — 15%):
  • 12-month cliff: zero tokens released for 12 months post-TGE
  • 36-month linear: tokens vest pro-rata per second from month 12 to month 48

Seed Round (10,000,000 MTA — 10%):
  • 6-month cliff: zero tokens released for 6 months post-TGE
  • 18-month linear: tokens vest pro-rata per second from month 6 to month 24

Revocation: Admin (multisig) can revoke a vesting schedule at any time. The earned portion is released \
to the beneficiary; unvested tokens are returned to the treasury address. This protects the DAO from \
team departure without rewarding unvested allocation.`,
  },
  {
    icon: Zap,
    color: '#fb923c',
    title: '4. Staking Protocol (MTAStaking)',
    content: `MTAStaking provides four fixed-APY staking tiers with per-position reward isolation:

Tier      | Lock Period | APY   | Early Exit Penalty
Bronze    | 30 days     |  8%   | 20% of principal
Silver    | 90 days     | 15%   | 20% of principal
Gold      | 180 days    | 25%   | 20% of principal
Platinum  | 365 days    | 40%   | 20% of principal

Reward formula: reward = principal × apyBps × elapsedSeconds / (10_000 × 31_536_000)

Each staking position is independently tracked (Position struct). Reward pool isolation prevents \
stake dilution — positions do not compete for a shared reward pool. The reward reserve is funded \
from the Ecosystem allocation (35M MTA) with 10M MTA committed at launch.

Early exit: a 20% penalty (EARLY_EXIT_PENALTY_BPS = 2,000 bps) is deducted from the staked \
principal and sent to the reward pool. All accrued rewards are paid out in full before the penalty \
is applied.`,
  },
  {
    icon: Vote,
    color: '#34d399',
    title: '5. Governance (MTAGovernor + MTATimelock)',
    content: `The governance system implements OpenZeppelin Governor v5 with TimelockController:

Governance Parameters:
  • Proposal threshold: 500,000 MTA (0.5% of supply)
  • Voting delay: 7,200 blocks (~24 hours on Ethereum mainnet)
  • Voting period: 50,400 blocks (~7 days)
  • Quorum: 4,000,000 MTA (4% of total supply)
  • Timelock delay: 172,800 seconds (48 hours)

Voting modes: AGAINST / FOR / ABSTAIN. Proposals pass if FOR votes > quorum AND FOR > AGAINST.

Timelock: All passed proposals queue in MTATimelock for a mandatory 48-hour delay before execution. \
This gives MTA holders time to exit positions if they disagree with a passed proposal (emergency exit window).

Role structure post-deploy:
  • PROPOSER_ROLE → MTAGovernor only
  • EXECUTOR_ROLE → address(0) (anyone can execute after timelock)
  • Deployer admin role → renounced after setup`,
  },
  {
    icon: BarChart3,
    color: '#f472b6',
    title: '6. Tokenomics',
    content: `Total Supply: 100,000,000 MTA (fixed, no inflation)

Allocation:
  Ecosystem Fund    35,000,000 MTA (35%) — Staking rewards, grants, partnerships
  Liquidity         20,000,000 MTA (20%) — DEX liquidity provision
  Treasury          15,000,000 MTA (15%) — DAO-controlled, governance-gated
  Team              15,000,000 MTA (15%) — 12m cliff + 36m linear vesting
  Seed Round        10,000,000 MTA (10%) — 6m cliff + 18m linear vesting
  Public Sale        5,000,000 MTA ( 5%) — Immediate, no lockup

Value Capture Mechanisms:
  1. Staking demand: Platinum tier locks MTA for 365 days, reducing circulating supply.
  2. Governance participation: Holding MTA grants voting power over treasury (15M MTA).
  3. Ecosystem grants: Projects building on MetaAras infrastructure receive MTA grants.
  4. Buyback mechanism: DAO can vote to use treasury ETH/stablecoins to buy and burn MTA.`,
  },
  {
    icon: Layers,
    color: '#60a5fa',
    title: '7. Smart Contract Architecture',
    content: `Contract stack and dependencies:

MTAToken.sol
  └── ERC20, ERC20Permit, ERC20Votes, ERC20Burnable, ERC20Pausable, AccessControl
      OpenZeppelin v5.3

MTAVesting.sol
  └── ReentrancyGuard, SafeERC20, AccessControl

MTAStaking.sol
  └── ReentrancyGuard, SafeERC20, Pausable, AccessControl

MTAGovernor.sol
  └── Governor, GovernorSettings, GovernorCountingSimple,
      GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl

MTATimelock.sol
  └── TimelockController

Design principles:
  • Checks-Effects-Interactions pattern throughout
  • Custom errors (not string revert messages) for gas efficiency
  • No delegatecall in staking or vesting (minimal proxy attack surface)
  • All state changes emit events for full off-chain auditability`,
  },
  {
    icon: Link2,
    color: '#22d3ee',
    title: '8. Multichain Architecture',
    content: `MetaAras deploys an identical contract stack on two EVM chains simultaneously:

Ethereum (primary governance chain):
  • Voting period: ~7 days (50,400 blocks at ~12s block time)
  • Timelock: 48 hours
  • Gas token: ETH
  • Explorer: etherscan.io
  • Tesnet: Sepolia (chainId 11155111)

BNB Smart Chain (high-throughput chain):
  • Voting period: ~7 days (~201,600 blocks at ~3s block time)
  • Timelock: 48 hours (172,800s — chain-agnostic)
  • Gas token: BNB
  • Explorer: bscscan.com
  • Testnet: BSC Testnet (chainId 97)

Cross-chain design principles:
  • Same contract bytecode deployed on both chains
  • No cross-chain bridge — each chain has an independent MTA instance
  • Frontend detects connected chain and routes to the correct contract set
  • Wrong network → user is prompted to switch to a supported chain
  • Each chain maintains its own governance and treasury

Frontend auto-detection:
  The DApp reads contract addresses per chain from network-prefixed env vars
  (e.g. NEXT_PUBLIC_ETH_SEPOLIA_MTA_TOKEN_ADDRESS vs NEXT_PUBLIC_BSC_TESTNET_MTA_TOKEN_ADDRESS).
  sync-env scripts populate these automatically after each network deploy.`,
  },
  {
    icon: GitBranch,
    color: '#818cf8',
    title: '9. Roadmap',
    content: `Phase 1 — Foundation (Completed ✓)
  • Smart contract development and unit testing
  • Frontend DApp (Next.js + RainbowKit)
  • Internal security review

Phase 2 — Testnet (Current)
  • Deploy to Ethereum Sepolia AND BSC Testnet simultaneously
  • Community testing period (4 weeks)
  • Bug bounty program launch

Phase 3 — Audit & Launch (Q3 2026)
  • External security audit (target: Trail of Bits or Certik)
  • Audit findings remediation
  • Mainnet deployment on Ethereum + BSC with multisig admin

Phase 4 — Ecosystem (Q4 2026+)
  • First governance proposal (treasury deployment)
  • Liquidity bootstrapping on Uniswap v4 (ETH) and PancakeSwap v4 (BSC)
  • DEX integration and liquidity incentives
  • Community grant program activation`,
  },
  {
    icon: Shield,
    color: '#4ade80',
    title: '9. Security Model',
    content: `Defense-in-depth security architecture:

Access Control: Role-based (RBAC) with OpenZeppelin AccessControl. No single-owner patterns. \
All privileged roles are intended to be transferred to a Gnosis Safe multisig (3-of-5) at launch.

Emergency Mechanisms:
  • Token pause: Halts all transfers (PAUSER role, multisig-controlled)
  • Staking pause: Halts new stakes and early exits (admin role)
  • Vesting revocation: Individual schedules can be revoked (admin role)
  • Governor: Proposals can be cancelled by proposer before execution

Known Risk Vectors Mitigated:
  • Flash loan governance attacks: Voting power snapshots at proposal creation block
  • Reentrancy: All external calls guarded by ReentrancyGuard and CEI pattern
  • Oracle dependency: None — no external price oracles used
  • Upgrade risks: Staking is non-upgradeable by design; immutable after audit

Audit Status: External audit pending (pre-mainnet requirement). Static analysis with \
Slither shows no high-severity findings.`,
  },
  {
    icon: AlertTriangle,
    color: '#fbbf24',
    title: '10. Risk Factors',
    content: `All participants should be aware of the following risk factors:

Smart Contract Risk: Despite careful design and testing, smart contracts may contain bugs. \
The external audit requirement before mainnet mitigates but does not eliminate this risk.

Regulatory Risk: The regulatory status of governance tokens varies by jurisdiction. MTA is \
designed as a utility/governance token, not a security. Participants should consult local regulations.

Market Risk: MTA token price is subject to market volatility. The staking APYs are denominated \
in MTA, not USD — staking rewards do not protect against token price depreciation.

Governance Risk: Token holders make binding decisions via governance. A majority coalition could \
theoretically vote for proposals unfavorable to minority holders. The 48-hour timelock provides \
an emergency exit window.

Liquidity Risk: Initial liquidity is limited. Large positions may face significant slippage.`,
  },
];

export default function WhitepaperPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Technical Document</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          MetaAras <span className="gradient-text">Whitepaper</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
          Complete technical specification, economic model, and governance framework
          of the MetaAras (MTA) protocol.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Badge variant="success" dot>v2.1 Published</Badge>
          <Badge variant="default">Pre-Audit</Badge>
          <Badge variant="brand">Multichain</Badge>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">Version 2.1 — June 2026 · 11 Sections · Multichain</p>
      </div>

      {/* Download card */}
      <Card className="mb-10 flex flex-col sm:flex-row items-center gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-7 h-7 text-brand-400" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold text-[var(--text-primary)]">MetaAras Whitepaper v2.0</p>
          <p className="text-sm text-[var(--text-muted)]">PDF · ~30 pages · English · MIT License</p>
        </div>
        <Button variant="outline" size="sm" disabled>
          <Download className="w-4 h-4 mr-1" /> Download PDF (Coming Soon)
        </Button>
      </Card>

      {/* Table of Contents */}
      <Card className="mb-10 p-6">
        <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          Table of Contents
        </h2>
        <ol className="space-y-1.5 text-sm text-[var(--text-secondary)]">
          {SECTIONS.map((s) => (
            <li key={s.title} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500/40 flex-shrink-0" />
              {s.title}
            </li>
          ))}
        </ol>
      </Card>

      {/* Sections */}
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <Card key={s.title} glow>
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${s.color}20` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-[var(--text-primary)] mb-3">{s.title}</h2>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {s.content}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-10 p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400 leading-relaxed">
            <strong>Disclaimer:</strong> This whitepaper is for informational purposes only and does not
            constitute financial or investment advice. MTA tokens are governance utility tokens and are not
            securities. Smart contracts have not yet undergone an external security audit. Do not invest
            funds you cannot afford to lose. Mainnet deployment is planned for Q3 2026 pending completion
            of an external security audit. Past performance of similar protocols does not predict future results.
          </p>
        </div>
      </div>
    </div>
  );
}
