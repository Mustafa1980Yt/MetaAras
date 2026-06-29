import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#080812' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://metaaras.io'),
  title: {
    default: 'MetaAras (MTA) — Web3 Governance & DeFi Protocol',
    template: '%s | MetaAras',
  },
  description:
    'MetaAras (MTA) is a professional-grade multichain DeFi protocol with on-chain governance, tiered staking (8–40% APY), and linear vesting on Ethereum and BNB Chain.',
  keywords: [
    'MetaAras', 'MTA', 'DeFi', 'Staking', 'Governance', 'Web3', 'Ethereum', 'BNB Chain',
    'BSC', 'Token', 'DAO', 'Vesting', 'Smart Contract', 'Multichain', 'APY',
  ],
  authors: [{ name: 'MetaAras Team' }],
  creator: 'MetaAras Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MetaAras',
    title: 'MetaAras (MTA) — Multichain Web3 Governance & DeFi Protocol',
    description:
      'Professional-grade multichain DeFi protocol with on-chain governance, tiered staking (8–40% APY), and transparent vesting on Ethereum + BNB Chain.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MetaAras (MTA) — Multichain DeFi Protocol',
    description: 'On-chain governance, tiered staking (8–40% APY), and linear vesting on Ethereum + BNB Chain.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
