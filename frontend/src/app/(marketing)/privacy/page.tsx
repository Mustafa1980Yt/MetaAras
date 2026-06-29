import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MetaAras Privacy Policy — how we collect, use, and protect your information.',
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: '1. Introduction',
    content: `MetaAras ("we", "us", or "our") operates the MetaAras protocol and the metaaras.io web interface (the "Service"). This Privacy Policy explains what information we collect, how we use it, and your rights regarding it.

By using the Service, you agree to the collection and use of information in accordance with this policy. This policy applies only to our web interface — on-chain transactions are public by nature and governed by the applicable blockchain network.`,
  },
  {
    title: '2. Information We Collect',
    content: `**2.1 Information You Provide**
We do not require account creation. We do not collect names, email addresses, or passwords through standard usage of the Service.

**2.2 Wallet Information**
When you connect a wallet, we receive your public wallet address. We do not have access to your private keys, seed phrases, or wallet balance beyond what the blockchain publicly provides.

**2.3 Usage Data**
We may collect anonymized analytics data including: pages visited, interactions with the interface, browser type and version, operating system, and referring URLs. This data does not contain personally identifiable information.

**2.4 Blockchain Data**
All transactions you submit through the interface are recorded on the relevant public blockchain (Ethereum, BNB Smart Chain). This data is permanent, public, and outside our control.`,
  },
  {
    title: '3. How We Use Information',
    content: `We use collected information solely to:
- Operate and improve the Service
- Detect and prevent technical issues and abuse
- Analyze aggregate usage patterns to improve user experience
- Comply with applicable laws and regulations

We do not sell, trade, or rent your information to third parties.`,
  },
  {
    title: '4. Cookies and Local Storage',
    content: `The Service uses browser local storage and cookies to:
- Remember your theme preference (dark/light mode)
- Store wallet connection preferences
- Maintain session state

We do not use tracking cookies for advertising purposes. You can clear local storage through your browser settings, which will reset your preferences.`,
  },
  {
    title: '5. Third-Party Services',
    content: `The Service integrates with the following third-party services:

**Blockchain RPC Providers** — We connect to Ethereum and BNB Chain nodes to read blockchain state. Your IP address may be visible to RPC providers.

**WalletConnect** — Used for wallet pairing. WalletConnect's own privacy policy applies to data processed through their relay infrastructure.

**IPFS / Decentralized Storage** — Governance proposals and metadata may be stored on IPFS.

We are not responsible for the privacy practices of these third-party services.`,
  },
  {
    title: '6. Data Security',
    content: `We implement reasonable technical measures to protect information against unauthorized access, alteration, or disclosure. However, no internet transmission is completely secure.

The MetaAras smart contracts are non-custodial. We cannot access, freeze, or transfer your tokens. Only you, via your private keys, have control over your assets.`,
  },
  {
    title: '7. Your Rights',
    content: `Depending on your jurisdiction, you may have the right to:
- Access data we hold about you
- Request deletion of your data (note: on-chain data cannot be deleted)
- Opt out of analytics collection
- Lodge a complaint with a data protection authority

To exercise any of these rights, contact us at privacy@metaaras.io.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `The Service is not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. If you believe a minor has provided us information, contact us immediately at privacy@metaaras.io.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy periodically. We will notify users of material changes by posting the updated policy on this page with a new "Last Updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact',
    content: `For privacy-related inquiries:

**Email:** privacy@metaaras.io
**Security issues:** security@metaaras.io

For general questions, visit our FAQ or contact page.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Legal</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Privacy <span className="gradient-text">Policy</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)]">Last updated: June 2026</p>
      </div>

      <Card className="mb-6 p-5 border-amber-500/30 bg-amber-500/5">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-amber-400">Non-Custodial Notice:</strong> MetaAras is a non-custodial protocol.
          We never hold, control, or have access to your private keys or funds.
          All financial activity occurs directly on public blockchains.
        </p>
      </Card>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">{section.title}</h2>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line space-y-2">
              {section.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className={paragraph.startsWith('**') ? 'font-semibold text-[var(--text-primary)] mt-3' : ''}>
                  {paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
