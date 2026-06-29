import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about the MetaAras (MTA) DeFi protocol — staking, governance, tokenomics, security, and multichain support.',
};

const FAQS = [
  {
    q: 'What is MetaAras (MTA)?',
    a: 'MetaAras is a professional-grade Web3 protocol featuring an ERC-20 governance token, tiered staking with fixed APY, linear vesting for allocations, and a fully on-chain DAO governance system.',
  },
  {
    q: 'What is the total MTA supply?',
    a: 'The total supply is fixed at 100,000,000 MTA (100 million). Minting is permanently disabled after the initial distribution via the revokeMinter() function.',
  },
  {
    q: 'How does staking work?',
    a: 'You lock MTA tokens for a chosen period (30, 90, 180, or 365 days) and earn fixed APY (8%, 15%, 25%, or 40%). Rewards accrue per-second and can be claimed or compounded at any time. Exiting before the lock period ends incurs a 20% penalty on your staked principal; accrued rewards are paid in full regardless.',
  },
  {
    q: 'When can I participate in governance?',
    a: 'Token holders who self-delegate (or are delegated) can participate in governance. Creating a proposal requires 500,000 MTA (0.5% of supply). Voting requires 4% quorum. All proposals execute through a 48-hour Timelock.',
  },
  {
    q: 'Is the protocol audited?',
    a: 'The smart contracts have passed internal review: 97/97 unit tests, Slither static analysis, and Solhint style checks. External audit by Certik or Trail of Bits is planned for Q2 2026, before mainnet deployment.',
  },
  {
    q: 'What chains are supported?',
    a: 'MetaAras is a multichain protocol with native deployment on Ethereum (mainnet + Sepolia testnet) and BNB Smart Chain (mainnet + BSC testnet). The DApp automatically detects your connected wallet\'s network and routes to the correct contract set. Layer 2 support (Arbitrum, Base) is planned for Phase 6 in 2027.',
  },
  {
    q: 'Can smart contracts be upgraded?',
    a: 'Only MTAStaking uses a UUPS upgradeable proxy. MTAToken, MTAVesting, MTAGovernor, and MTATimelock are non-upgradeable. All upgrades to MTAStaking require UPGRADER_ROLE (held by the Timelock in production).',
  },
  {
    q: 'How is team vesting structured?',
    a: 'The 15M MTA team allocation has a 12-month cliff followed by 36-month linear vesting. No tokens are released before the cliff. The schedule is revocable, meaning if a team member leaves, unvested tokens return to treasury.',
  },
  {
    q: 'What happens if I exit staking early?',
    a: 'A 20% penalty is applied to your staked principal — 80% of your principal is returned immediately. All accrued rewards are paid to you in full; there is no withholding on rewards. The penalty amount goes to the reward pool.',
  },
  {
    q: 'How do I contact the team?',
    a: 'Reach us via the Contact page, Telegram community, or GitHub repository. For security vulnerabilities, please contact security@metaaras.io directly — do not publicly disclose.',
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Help Center</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
        <p className="text-[var(--text-secondary)]">
          Everything you need to know about MetaAras and the MTA protocol.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <Card key={i} glow>
            <h2 className="font-semibold text-[var(--text-primary)] mb-2">{faq.q}</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
