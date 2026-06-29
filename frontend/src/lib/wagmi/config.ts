'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, bsc, bscTestnet, hardhat } from 'wagmi/chains';

export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo-project-id';

export const wagmiConfig = getDefaultConfig({
  appName: 'MetaAras (MTA)',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, sepolia, bsc, bscTestnet, hardhat],
  ssr: true,
});
