import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MetaAras Terms of Service — rules and conditions for using the MetaAras protocol and interface.',
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the MetaAras web interface (available at metaaras.io) or any related services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.

These Terms apply to all users, visitors, and others who access or use the Service.`,
  },
  {
    title: '2. Description of Service',
    content: `MetaAras provides a web interface for interacting with the MetaAras smart contract protocol deployed on Ethereum and BNB Smart Chain. The Service includes:

- A read interface for viewing token balances, staking positions, governance proposals, and vesting schedules
- A transaction interface for submitting blockchain transactions (staking, unstaking, claiming rewards, voting, creating proposals)
- Informational content including documentation, whitepaper, and protocol analytics

The Service is a non-custodial interface. We do not hold assets, execute transactions on your behalf, or have the ability to reverse transactions.`,
  },
  {
    title: '3. Eligibility',
    content: `You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that:

- You are at least 18 years old
- You have the legal capacity to enter into these Terms
- Your use of the Service complies with all applicable laws in your jurisdiction
- You are not located in, or a resident of, any jurisdiction where participation in DeFi protocols or cryptocurrency activities is prohibited

The Service is not available to users in jurisdictions where it is restricted by law. It is your responsibility to ensure compliance with local regulations.`,
  },
  {
    title: '4. Non-Custodial Nature',
    content: `MetaAras is a non-custodial protocol. This means:

- We do not control your private keys or seed phrases
- We cannot access, freeze, or recover your funds
- We cannot reverse blockchain transactions
- You are solely responsible for the security of your wallet and private keys
- Loss of access to your wallet means permanent loss of the associated assets

Never share your private keys or seed phrase with anyone, including MetaAras team members.`,
  },
  {
    title: '5. Financial Risks',
    content: `Using the MetaAras protocol involves significant financial risk. By using the Service, you acknowledge:

- Smart contracts may contain bugs or vulnerabilities
- Cryptocurrency values are highly volatile and may decrease to zero
- Staking locks your tokens for a defined period; early exit incurs a 20% penalty on your staked principal
- DeFi protocols operate autonomously; code execution is final
- Gas costs apply to all on-chain transactions
- The MetaAras token (MTA) is a utility/governance token and is not an investment contract or security

Please read our Risk Disclosure document before participating.`,
  },
  {
    title: '6. Prohibited Uses',
    content: `You agree not to use the Service to:

- Violate any applicable laws or regulations
- Manipulate or exploit the protocol in ways not intended by the design
- Submit fraudulent or misleading governance proposals
- Engage in any form of market manipulation
- Circumvent any security or access controls
- Harvest or scrape user data
- Transmit any malware, viruses, or malicious code
- Impersonate any person or entity

We reserve the right to restrict access to users who violate these Terms.`,
  },
  {
    title: '7. Intellectual Property',
    content: `The MetaAras web interface, documentation, and branding are owned by the MetaAras project. The smart contracts are released under the MIT License and are open source.

You may fork, reproduce, or build upon the smart contracts in accordance with the MIT License. You may not use the MetaAras brand, logo, or name in ways that imply endorsement without prior written permission.`,
  },
  {
    title: '8. Disclaimers',
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:

- Warranties of merchantability or fitness for a particular purpose
- Warranties that the Service will be uninterrupted or error-free
- Warranties regarding the accuracy or completeness of any information
- Warranties that defects will be corrected

The smart contracts have undergone internal review and testing but have not been subject to a formal external audit as of this writing. External audit is planned prior to mainnet deployment.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL METAARAS, ITS CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.

THIS LIMITATION APPLIES EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS DO NOT ALLOW THESE LIMITATIONS, IN WHICH CASE THEY APPLY TO THE MAXIMUM EXTENT PERMITTED.`,
  },
  {
    title: '10. Governing Law',
    content: `These Terms are governed by and construed in accordance with applicable law. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration rather than in court, except where prohibited by law.`,
  },
  {
    title: '11. Modifications',
    content: `We reserve the right to modify these Terms at any time. Material changes will be communicated by posting the updated Terms with a new effective date. Your continued use of the Service after changes constitutes acceptance of the updated Terms.

It is your responsibility to review these Terms periodically.`,
  },
  {
    title: '12. Contact',
    content: `For questions about these Terms:

**Email:** legal@metaaras.io
**Security:** security@metaaras.io`,
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Legal</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Terms of <span className="gradient-text">Service</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)]">Last updated: June 2026 · Effective: June 2026</p>
      </div>

      <Card className="mb-6 p-5 border-amber-500/30 bg-amber-500/5">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-amber-400">Important:</strong> This is a non-custodial DeFi protocol.
          Participation involves significant financial risk. Please read these Terms and our{' '}
          <a href="/risk" className="text-brand-400 hover:underline">Risk Disclosure</a> before using the Service.
        </p>
      </Card>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">{section.title}</h2>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {section.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-2">{paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
