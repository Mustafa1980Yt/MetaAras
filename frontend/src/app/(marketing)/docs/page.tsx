import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Code, BookOpen, Shield, Zap, Vote, Lock,
  Terminal, GitBranch, Layers, FileText, AlertTriangle, Package,
  ArrowRight, CheckCircle, Link2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Complete developer documentation for the MetaAras (MTA) protocol',
};

const QUICK_LINKS = [
  { icon: BookOpen, label: 'Whitepaper',  href: '/whitepaper', desc: 'Full technical spec',    color: '#6366f1' },
  { icon: FileText, label: 'Tokenomics',  href: '/tokenomics', desc: 'Supply & allocation',    color: '#22d3ee' },
  { icon: GitBranch, label: 'Roadmap',    href: '/roadmap',    desc: 'Development timeline',   color: '#34d399' },
  { icon: Shield,   label: 'Security',    href: '#security',   desc: 'Audit & access control', color: '#f472b6' },
];

const CONTRACT_DOCS = [
  {
    name: 'MTAToken',
    file: 'contracts/core/MTAToken.sol',
    color: '#6366f1',
    desc: 'ERC-20 + Permit + Votes + Burnable + Pausable',
    functions: [
      { sig: 'mint(address, uint256)',        role: 'MINTER_ROLE',     desc: 'Create new tokens (disabled after revokeMinter)' },
      { sig: 'revokeMinter()',                role: 'DEFAULT_ADMIN',   desc: 'Permanently disable minting capability' },
      { sig: 'blacklist(address)',            role: 'BLACKLISTER_ROLE', desc: 'Block address from transfers' },
      { sig: 'pause() / unpause()',           role: 'PAUSER_ROLE',     desc: 'Emergency halt all token transfers' },
      { sig: 'delegate(address)',             role: 'Public',           desc: 'Delegate voting power to another address' },
      { sig: 'permit(owner, spender, …)',     role: 'Public',           desc: 'EIP-2612 gasless approval' },
    ],
  },
  {
    name: 'MTAVesting',
    file: 'contracts/core/MTAVesting.sol',
    color: '#a78bfa',
    desc: 'Linear vesting with cliff periods and revocation',
    functions: [
      { sig: 'createSchedule(beneficiary, amount, start, cliff, duration, revocable)', role: 'DEFAULT_ADMIN', desc: 'Create a new vesting schedule' },
      { sig: 'release(scheduleId)',           role: 'Beneficiary',     desc: 'Claim all currently vested tokens' },
      { sig: 'revoke(scheduleId)',            role: 'DEFAULT_ADMIN',   desc: 'Cancel schedule, return unvested to treasury' },
      { sig: 'vestedAmount(scheduleId, ts)',  role: 'View',            desc: 'Calculate vested amount at given timestamp' },
    ],
  },
  {
    name: 'MTAStaking',
    file: 'contracts/core/MTAStaking.sol',
    color: '#fb923c',
    desc: 'Four-tier APY staking with per-position rewards',
    functions: [
      { sig: 'stake(uint256, Tier)',          role: 'Public',          desc: 'Lock MTA tokens for a fixed APY tier' },
      { sig: 'unstake(uint256 positionId)',   role: 'Position owner',  desc: 'Withdraw stake + rewards (or early-exit with 20% principal penalty)' },
      { sig: 'pendingRewards(uint256)',       role: 'View',            desc: 'Calculate accrued rewards for a position' },
      { sig: 'pause() / unpause()',           role: 'DEFAULT_ADMIN',   desc: 'Emergency halt staking operations' },
    ],
  },
  {
    name: 'MTAGovernor',
    file: 'contracts/governance/MTAGovernor.sol',
    color: '#34d399',
    desc: 'OpenZeppelin Governor with timelock execution',
    functions: [
      { sig: 'propose(targets, values, …)',  role: '≥500K MTA',       desc: 'Submit a new governance proposal' },
      { sig: 'castVote(proposalId, support)', role: 'MTA holders',    desc: 'Vote FOR(1), AGAINST(0), or ABSTAIN(2)' },
      { sig: 'queue(proposalId)',            role: 'Public',           desc: 'Queue a passed proposal for timelock' },
      { sig: 'execute(proposalId)',          role: 'Public',           desc: 'Execute proposal after 48h timelock' },
      { sig: 'cancel(proposalId)',           role: 'Proposer',         desc: 'Cancel pending proposal before execution' },
    ],
  },
  {
    name: 'MTATimelock',
    file: 'contracts/governance/MTATimelock.sol',
    color: '#60a5fa',
    desc: 'TimelockController — 48-hour execution delay',
    functions: [
      { sig: 'schedule(target, value, …)',   role: 'PROPOSER_ROLE',   desc: 'Schedule an operation (via Governor)' },
      { sig: 'execute(target, value, …)',    role: 'EXECUTOR_ROLE',   desc: 'Execute after delay passes' },
      { sig: 'cancel(id)',                   role: 'CANCELLER_ROLE',  desc: 'Cancel a pending operation' },
    ],
  },
];

const DEPLOY_STEPS_ETH = [
  { step: '1', cmd: 'cp .env.example .env  # PRIVATE_KEY, ALCHEMY_API_KEY, ETHERSCAN_API_KEY doldur', desc: 'Ortam değişkenlerini hazırla' },
  { step: '2', cmd: 'npm run preflight:sepolia', desc: 'Preflight — bakiye, key format, ağ bağlantısı kontrol' },
  { step: '3', cmd: 'npm run deploy:sepolia', desc: 'Ethereum Sepolia\'ya 5 kontrat deploy et' },
  { step: '4', cmd: 'npm run verify:sepolia', desc: 'Etherscan\'da kontratları doğrula' },
  { step: '5', cmd: 'npm run sync-env:sepolia', desc: 'frontend/.env.local\'ı Sepolia adresleriyle güncelle' },
  { step: '6', cmd: 'npm run state:sepolia', desc: 'On-chain durum doğrulama' },
];

const DEPLOY_STEPS_BSC = [
  { step: '1', cmd: 'cp .env.example .env  # PRIVATE_KEY, BSCSCAN_API_KEY doldur', desc: 'Ortam değişkenlerini hazırla (Alchemy gerekmez)' },
  { step: '2', cmd: 'npm run preflight:bscTestnet', desc: 'Preflight — BSC bakiye kontrolü (min 0.05 BNB)' },
  { step: '3', cmd: 'npm run deploy:bscTestnet', desc: 'BSC Testnet\'e 5 kontrat deploy et' },
  { step: '4', cmd: 'npm run verify:bscTestnet', desc: 'BscScan\'da kontratları doğrula' },
  { step: '5', cmd: 'npm run sync-env:bscTestnet', desc: 'frontend/.env.local\'ı BSC adresleriyle ekle' },
  { step: '6', cmd: 'cd frontend && npm run build', desc: 'Frontend\'i her iki ağın adresleriyle derle' },
];

const STAKING_TIERS = [
  { tier: 'Bronze',   apy: '8%',  lock: '30 days',  penalty: '20% of principal' },
  { tier: 'Silver',   apy: '15%', lock: '90 days',  penalty: '20% of principal' },
  { tier: 'Gold',     apy: '25%', lock: '180 days', penalty: '20% of principal' },
  { tier: 'Platinum', apy: '40%', lock: '365 days', penalty: '20% of principal' },
];

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Developer Documentation</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          MetaAras <span className="gradient-text">Documentation</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Complete technical reference for the MetaAras (MTA) protocol — smart contracts,
          deployment guides, integration examples, and API references.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {QUICK_LINKS.map((q) => (
          <Link key={q.label} href={q.href}>
            <Card className="p-4 hover:border-brand-500/40 transition-colors cursor-pointer h-full">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${q.color}20` }}>
                <q.icon className="w-4 h-4" style={{ color: q.color }} />
              </div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">{q.label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{q.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Getting Started */}
      <section id="overview" className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Terminal className="w-6 h-6 text-brand-400" />
          Getting Started
        </h2>

        <Card className="mb-6 p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Prerequisites</h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            {[
              'Node.js v20+ and npm v10+',
              'Git',
              'Alchemy API key — Ethereum Sepolia RPC (free tier)',
              'Etherscan API key — Ethereum contract verification',
              'BscScan API key — BSC contract verification',
              'Dedicated deployment wallet with testnet ETH (Sepolia) AND tBNB (BSC Testnet)',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Faucet referansları */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">Ethereum Sepolia — Testnet ETH</h3>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between items-center">
                <span>sepoliafaucet.com</span>
                <span className="text-green-400 font-medium">0.5 ETH/gün</span>
              </div>
              <div className="text-[var(--text-muted)]">Alchemy hesabı gerekli</div>
              <div className="flex justify-between items-center">
                <span>faucets.chain.link/sepolia</span>
                <span className="text-green-400 font-medium">0.1 ETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span>infura.io/faucet/sepolia</span>
                <span className="text-green-400 font-medium">0.5 ETH/gün</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--border)] text-amber-400">
                Minimum gereksinim: 0.15 ETH
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">BSC Testnet — tBNB</h3>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between items-center">
                <span>testnet.binance.org/faucet-smart</span>
                <span className="text-green-400 font-medium">0.5 tBNB</span>
              </div>
              <div className="text-[var(--text-muted)]">BNB Chain hesabı gerekli</div>
              <div className="flex justify-between items-center">
                <span>faucet.quicknode.com/bnb-testnet</span>
                <span className="text-green-400 font-medium">0.05 tBNB</span>
              </div>
              <div className="flex justify-between items-center">
                <span>faucet.triangleplatform.com/bscTestnet</span>
                <span className="text-green-400 font-medium">0.1 tBNB</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--border)] text-amber-400">
                Minimum gereksinim: 0.05 tBNB
              </div>
            </div>
          </Card>
        </div>

        <Card className="mb-6 p-5 bg-blue-500/5 border-blue-500/20">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            BSC Testnet RPC Notu
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Public BSC Testnet RPC (<code className="text-brand-400">data-seed-prebsc-1-s1.binance.org:8545</code>) çoğu zaman yeterlidir.
            Rate limit alırsanız <code className="font-mono">.env</code> dosyasına özel RPC ekleyin:
          </p>
          <div className="mt-2 bg-[var(--surface-2)] rounded-lg px-3 py-2">
            <code className="text-xs font-mono text-brand-400">BSC_TESTNET_RPC_URL=https://your-custom-rpc-endpoint</code>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Ücretsiz özel RPC: QuickNode · Ankr · Chainstack (BSC Testnet seçin)
          </p>
        </Card>

        <Card className="mb-6 p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Installation</h3>
          <div className="space-y-3">
            {[
              'git clone https://github.com/metaaras/metaaras-protocol',
              'cd metaaras && npm install',
              'cd frontend && npm install',
              'cd .. && npx hardhat compile',
              'npx hardhat test test/unit/',
            ].map((cmd) => (
              <div key={cmd} className="bg-[var(--surface-2)] rounded-xl px-4 py-3 flex items-center gap-3">
                <Code className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <code className="text-sm text-[var(--text-primary)] font-mono break-all">{cmd}</code>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Ethereum Sepolia — Deploy Pipeline
          </h3>
          <div className="space-y-3 mb-8">
            {DEPLOY_STEPS_ETH.map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold
                  flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="bg-[var(--surface-2)] rounded-lg px-3 py-2 mb-1">
                    <code className="text-xs font-mono text-[var(--text-primary)] break-all">{s.cmd}</code>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-400" />
            BNB Smart Chain Testnet — Deploy Pipeline
          </h3>
          <div className="space-y-3">
            {DEPLOY_STEPS_BSC.map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold
                  flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="bg-[var(--surface-2)] rounded-lg px-3 py-2 mb-1">
                    <code className="text-xs font-mono text-[var(--text-primary)] break-all">{s.cmd}</code>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Multichain Architecture */}
      <section id="multichain" className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Link2 className="w-6 h-6 text-brand-400" />
          Multichain Architecture
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            {
              label: 'Ethereum Sepolia',
              chainId: '11155111',
              currency: 'ETH',
              rpc: 'Alchemy',
              verify: 'Etherscan',
              envPrefix: 'ETH_SEPOLIA',
              color: '#6366f1',
            },
            {
              label: 'BNB Smart Chain Testnet',
              chainId: '97',
              currency: 'tBNB',
              rpc: 'Public BSC RPC',
              verify: 'BscScan',
              envPrefix: 'BSC_TESTNET',
              color: '#f59e0b',
            },
          ].map((chain) => (
            <Card key={chain.label} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: chain.color }} />
                <p className="font-semibold text-sm text-[var(--text-primary)]">{chain.label}</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Chain ID</span>
                  <span className="font-mono text-[var(--text-secondary)]">{chain.chainId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Gas Token</span>
                  <span className="text-[var(--text-secondary)]">{chain.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">RPC</span>
                  <span className="text-[var(--text-secondary)]">{chain.rpc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Verify</span>
                  <span className="text-[var(--text-secondary)]">{chain.verify}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Env prefix</span>
                  <code className="text-brand-400">NEXT_PUBLIC_{chain.envPrefix}_MTA_*</code>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-5">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Frontend auto-detection</p>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            The DApp reads contract addresses per chain from network-prefixed env vars. Running
            both sync-env commands populates all four address sets so users can seamlessly switch
            chains in their wallet — the DApp routes to the correct contracts automatically.
          </p>
          <div className="bg-[var(--surface-2)] rounded-xl p-4 font-mono text-xs text-[var(--text-secondary)] overflow-x-auto">
            <pre>{`# .env.local after deploying to both testnets:
NEXT_PUBLIC_ETH_SEPOLIA_MTA_TOKEN_ADDRESS=0xABC...   # Ethereum Sepolia
NEXT_PUBLIC_BSC_TESTNET_MTA_TOKEN_ADDRESS=0xDEF...   # BSC Testnet

# Frontend routes via useChainId():
const chainId = useChainId();
const { address, abi } = getTokenContract(chainId); // ← chain-aware`}</pre>
          </div>
        </Card>
      </section>

      {/* Contract Reference */}
      <section id="contracts" className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Layers className="w-6 h-6 text-brand-400" />
          Smart Contract Reference
        </h2>
        <div className="space-y-6">
          {CONTRACT_DOCS.map((contract) => (
            <Card key={contract.name} glow className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${contract.color}20` }}>
                  <Code className="w-5 h-5" style={{ color: contract.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{contract.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{contract.file}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{contract.desc}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Function', 'Access', 'Description'].map((h) => (
                        <th key={h} className="text-left pb-2 text-[var(--text-muted)] font-medium pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {contract.functions.map((fn) => (
                      <tr key={fn.sig} className="hover:bg-[var(--surface-2)] transition-colors">
                        <td className="py-2 pr-4 font-mono text-brand-400 whitespace-nowrap">{fn.sig.split('(')[0]}(…)</td>
                        <td className="py-2 pr-4 text-[var(--text-muted)] whitespace-nowrap">{fn.role}</td>
                        <td className="py-2 text-[var(--text-secondary)]">{fn.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Staking Reference */}
      <section id="tiers" className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-brand-400" />
          Staking Tier Reference
        </h2>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Tier', 'APY', 'Lock Period', 'Early Exit Penalty', 'Min Stake'].map((h) => (
                    <th key={h} className="text-left pb-3 text-[var(--text-muted)] font-medium pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {STAKING_TIERS.map((t) => (
                  <tr key={t.tier}>
                    <td className="py-3 pr-6 font-semibold text-[var(--text-primary)]">{t.tier}</td>
                    <td className="py-3 pr-6 text-green-400 font-bold">{t.apy}</td>
                    <td className="py-3 pr-6 text-[var(--text-secondary)]">{t.lock}</td>
                    <td className="py-3 pr-6 text-amber-400">{t.penalty}</td>
                    <td className="py-3 text-[var(--text-muted)]">1 MTA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-[var(--surface-2)] rounded-xl">
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              Reward formula: <span className="text-brand-400">reward = amount × apyBps × elapsed / (10_000 × 31_536_000)</span>
            </p>
          </div>
        </Card>
      </section>

      {/* Governance */}
      <section id="governance" className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Vote className="w-6 h-6 text-brand-400" />
          Governance Parameters
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Proposal Threshold', value: '500,000 MTA', desc: '0.5% of total supply' },
            { label: 'Voting Delay',       value: '7,200 blocks', desc: '~24 hours on Ethereum mainnet' },
            { label: 'Voting Period',      value: '50,400 blocks', desc: '~7 days on Ethereum mainnet' },
            { label: 'Quorum Required',    value: '4,000,000 MTA', desc: '4% of total supply' },
            { label: 'Timelock Delay',     value: '172,800 seconds', desc: '48 hours before execution' },
            { label: 'Vote Options',       value: 'FOR / AGAINST / ABSTAIN', desc: 'GovernorBravo compatible' },
          ].map((p) => (
            <Card key={p.label} className="p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">{p.label}</p>
              <p className="font-bold text-[var(--text-primary)] text-sm">{p.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-400" />
          Security &amp; Audit Status
        </h2>
        <Card className="p-6">
          <div className="space-y-4">
            {[
              { title: 'Access Control',          status: 'complete', desc: 'Role-based (RBAC) with OpenZeppelin AccessControl. No single-owner Ownable patterns.' },
              { title: 'Reentrancy Protection',   status: 'complete', desc: 'All state-changing functions use ReentrancyGuard or Checks-Effects-Interactions.' },
              { title: 'Integer Safety',          status: 'complete', desc: 'Solidity 0.8.24 native overflow/underflow protection. SafeERC20 for all token transfers.' },
              { title: 'Static Analysis (Slither)', status: 'complete', desc: 'No high-severity findings. See /audit directory for full report.' },
              { title: 'External Audit',          status: 'pending', desc: 'Planned with Trail of Bits or Certik for Q3 2026 before mainnet deployment.' },
              { title: 'Bug Bounty',              status: 'pending', desc: 'Bug bounty program launches concurrent with testnet deployment.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{item.title}</p>
                    <Badge variant={item.status === 'complete' ? 'success' : 'default'} className="text-xs">
                      {item.status === 'complete' ? '✓ Implemented' : '⏳ Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Frontend Integration */}
      <section id="integration" className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Code className="w-6 h-6 text-brand-400" />
          Frontend Integration (wagmi v2)
        </h2>
        <Card className="p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Reading contract state</h3>
          <div className="bg-[var(--surface-2)] rounded-xl p-4 font-mono text-xs text-[var(--text-secondary)] overflow-x-auto">
            <pre>{`import { useReadContract, useChainId } from 'wagmi';
import { getTokenContract } from '@/lib/contracts';

// Get MTA token balance
const chainId = useChainId();
const { data: balance } = useReadContract({
  ...getTokenContract(chainId),
  functionName: 'balanceOf',
  args: [userAddress],
});`}</pre>
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mt-6 mb-3">Writing to contracts</h3>
          <div className="bg-[var(--surface-2)] rounded-xl p-4 font-mono text-xs text-[var(--text-secondary)] overflow-x-auto">
            <pre>{`import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { getStakingContract } from '@/lib/contracts';

const { writeContract } = useWriteContract();
// Stake 1000 MTA at Platinum tier (tier index 3)
writeContract({
  ...getStakingContract(chainId),
  functionName: 'stake',
  args: [parseEther('1000'), 3],
});`}</pre>
          </div>
        </Card>
      </section>

      {/* Footer nav */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-[var(--border)]">
        <p className="text-sm text-[var(--text-muted)]">MetaAras Documentation v2.1 — Multichain — June 2026</p>
        <div className="flex gap-4">
          <Link href="/whitepaper" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Whitepaper <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/tokenomics" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Tokenomics <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
