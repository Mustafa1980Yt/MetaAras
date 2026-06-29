import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/marketing/HeroSection';
import { ProtocolStatsSection } from '@/components/marketing/ProtocolStatsSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { StakingTiersSection } from '@/components/marketing/StakingTiersSection';
import { GovernanceSection } from '@/components/marketing/GovernanceSection';
import { SecuritySection } from '@/components/marketing/SecuritySection';
import { CTASection } from '@/components/marketing/CTASection';

export const metadata: Metadata = {
  title: 'MetaAras — Professional Web3 DeFi Protocol',
  description:
    'MetaAras (MTA) is a multichain governance and staking protocol on Ethereum & BNB Smart Chain. Earn up to 40% APY with tiered staking and participate in on-chain governance.',
  openGraph: {
    title: 'MetaAras — Professional Web3 DeFi Protocol',
    description: 'Earn up to 40% APY. Govern on-chain. Fully transparent DeFi.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProtocolStatsSection />
        <HowItWorksSection />
        <StakingTiersSection />
        <GovernanceSection />
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
