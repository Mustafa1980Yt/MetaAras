import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, Shield, Zap, Globe, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Risk Disclosure',
  description: 'MetaAras Risk Disclosure — understand the risks of participating in the MetaAras DeFi protocol.',
  robots: { index: true, follow: true },
};

const RISK_CATEGORIES = [
  {
    icon: Zap,
    color: '#f59e0b',
    title: 'Smart Contract Risk',
    risks: [
      {
        label: 'Code Vulnerabilities',
        detail: 'Despite rigorous testing (97/97 unit tests, Slither analysis), smart contracts may contain undiscovered bugs. An external audit is planned for Q2 2026 but has not yet been completed. All funds staked or held by the contracts are subject to this risk.',
      },
      {
        label: 'Upgrade Risk (MTAStaking)',
        detail: 'The MTAStaking contract uses a UUPS upgradeable proxy. While upgrades require UPGRADER_ROLE (held by Timelock in production), a malicious or buggy upgrade could affect staked balances. The upgrade authority is governed by the DAO.',
      },
      {
        label: 'Oracle and Integration Risk',
        detail: 'The protocol currently does not use price oracles. If external price data or integrations are added in future upgrades, this introduces additional risk vectors.',
      },
    ],
  },
  {
    icon: Globe,
    color: '#6366f1',
    title: 'Market Risk',
    risks: [
      {
        label: 'Token Price Volatility',
        detail: 'The value of MTA tokens may decrease significantly or go to zero. Cryptocurrency markets are highly volatile, speculative, and influenced by factors outside the protocol\'s control.',
      },
      {
        label: 'APY Sustainability',
        detail: 'Staking APY is funded from the Ecosystem Fund allocation (35M MTA). If the ecosystem fund is depleted before the reward pool is replenished through protocol revenue, reward rates may need to be adjusted via governance.',
      },
      {
        label: 'Liquidity Risk',
        detail: 'There may be limited liquidity for MTA on decentralized exchanges, particularly at launch. Selling large positions may result in significant price impact.',
      },
    ],
  },
  {
    icon: Lock,
    color: '#a78bfa',
    title: 'Staking Risk',
    risks: [
      {
        label: 'Lock Period and Early Exit Penalty',
        detail: 'Staked tokens are locked for 30, 90, 180, or 365 days depending on the chosen tier. If you exit before the lock period expires, a 20% penalty is deducted from your staked principal (EARLY_EXIT_PENALTY_BPS = 2,000 basis points). All accrued rewards are paid to you in full regardless of when you exit.',
      },
      {
        label: 'Opportunity Cost',
        detail: 'By locking tokens in the staking contract, you lose the ability to use them for trading, providing liquidity elsewhere, or other DeFi opportunities for the duration of the lock period.',
      },
      {
        label: 'Reward Calculation Risk',
        detail: 'Rewards are calculated on a per-second basis using the rate at the time of staking. If the reward rate changes due to governance action during your lock period, your accrued (but unclaimed) rewards may be affected.',
      },
    ],
  },
  {
    icon: Shield,
    color: '#34d399',
    title: 'Governance Risk',
    risks: [
      {
        label: 'Governance Attacks',
        detail: 'If a single entity accumulates 4%+ of voting power, they could potentially pass proposals without broad community support. The 48-hour Timelock provides a window to react before execution.',
      },
      {
        label: 'Low Participation Risk',
        detail: 'Governance requires 4% quorum to pass proposals. If participation is low, important protocol decisions may fail to reach quorum, leaving the protocol unable to adapt.',
      },
      {
        label: 'Proposal Threshold',
        detail: 'Creating governance proposals requires 500,000 MTA. This threshold may create barriers for smaller token holders, potentially concentrating governance power.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    color: '#ef4444',
    title: 'Operational Risk',
    risks: [
      {
        label: 'Wallet Security',
        detail: 'Loss of access to your private keys or seed phrase means permanent loss of your tokens. MetaAras cannot recover funds from lost wallets. Use hardware wallets and secure backups for significant amounts.',
      },
      {
        label: 'Phishing and Scams',
        detail: 'Malicious actors may create fake MetaAras websites or social media accounts. Always verify you are on the official metaaras.io domain. We will never ask for your private key or seed phrase.',
      },
      {
        label: 'Network Congestion and Gas Costs',
        detail: 'Transactions on Ethereum or BNB Chain require gas fees that fluctuate with network demand. During periods of congestion, gas costs may exceed expected amounts. Failed transactions still consume gas.',
      },
      {
        label: 'Regulatory Risk',
        detail: 'Cryptocurrency and DeFi regulations are evolving globally. Changes in applicable laws could restrict or prohibit access to the Service in certain jurisdictions. We cannot guarantee ongoing availability in all regions.',
      },
    ],
  },
];

export default function RiskPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Legal</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Risk <span className="gradient-text">Disclosure</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Using DeFi protocols involves significant risks. Read this document carefully before participating.
        </p>
      </div>

      {/* Warning card */}
      <Card className="mb-10 p-6 border-red-500/40 bg-red-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-400 mb-2">Important Warning</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Participation in the MetaAras protocol involves substantial risk of financial loss.
              Do not invest funds you cannot afford to lose. This is not financial advice.
              The MetaAras protocol is experimental software operating in an emerging and
              uncertain regulatory environment. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-8">
        {RISK_CATEGORIES.map((category) => (
          <div key={category.title}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${category.color}20` }}>
                <category.icon className="w-4 h-4" style={{ color: category.color }} />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{category.title}</h2>
            </div>

            <div className="space-y-3">
              {category.risks.map((risk) => (
                <Card key={risk.label} className="p-5">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2" style={{ color: category.color }}>
                    {risk.label}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{risk.detail}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Acknowledgement */}
      <Card className="mt-10 p-6 border-brand-500/30">
        <h2 className="font-bold text-[var(--text-primary)] mb-3">Acknowledgement</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
          By using the MetaAras protocol and interface, you acknowledge that you have read, understood,
          and accepted these risks. You confirm that you are not relying on MetaAras for financial,
          legal, or investment advice.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          This Risk Disclosure was last updated in June 2026. For questions, contact{' '}
          <a href="mailto:legal@metaaras.io" className="text-brand-400 hover:underline">legal@metaaras.io</a>.
        </p>
      </Card>
    </div>
  );
}
