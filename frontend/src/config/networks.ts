import { mainnet, sepolia, bsc, bscTestnet, hardhat } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

export interface NetworkConfig {
  chain: Chain;
  label: string;
  shortLabel: string;
  explorer: string;
  explorerName: string;
  isTestnet: boolean;
  nativeCurrency: string;
  envPrefix: string;
}

export const NETWORK_CONFIGS: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    chain: mainnet,
    label: 'Ethereum Mainnet',
    shortLabel: 'Ethereum',
    explorer: 'https://etherscan.io',
    explorerName: 'Etherscan',
    isTestnet: false,
    nativeCurrency: 'ETH',
    envPrefix: 'ETH_MAINNET',
  },
  [sepolia.id]: {
    chain: sepolia,
    label: 'Ethereum Sepolia',
    shortLabel: 'Sepolia',
    explorer: 'https://sepolia.etherscan.io',
    explorerName: 'Etherscan',
    isTestnet: true,
    nativeCurrency: 'ETH',
    envPrefix: 'ETH_SEPOLIA',
  },
  [bsc.id]: {
    chain: bsc,
    label: 'BNB Smart Chain',
    shortLabel: 'BSC',
    explorer: 'https://bscscan.com',
    explorerName: 'BscScan',
    isTestnet: false,
    nativeCurrency: 'BNB',
    envPrefix: 'BSC_MAINNET',
  },
  [bscTestnet.id]: {
    chain: bscTestnet,
    label: 'BNB Testnet',
    shortLabel: 'BSC Testnet',
    explorer: 'https://testnet.bscscan.com',
    explorerName: 'BscScan',
    isTestnet: true,
    nativeCurrency: 'tBNB',
    envPrefix: 'BSC_TESTNET',
  },
  [hardhat.id]: {
    chain: hardhat,
    label: 'Localhost (Hardhat)',
    shortLabel: 'Localhost',
    explorer: '',
    explorerName: '',
    isTestnet: true,
    nativeCurrency: 'ETH',
    envPrefix: 'HARDHAT',
  },
};

export const SUPPORTED_MAINNET_CHAIN_IDS = [mainnet.id, bsc.id] as const;
export const SUPPORTED_TESTNET_CHAIN_IDS = [sepolia.id, bscTestnet.id, hardhat.id] as const;
export const ALL_SUPPORTED_CHAIN_IDS = [
  ...SUPPORTED_MAINNET_CHAIN_IDS,
  ...SUPPORTED_TESTNET_CHAIN_IDS,
] as const;

export const NETWORK_ENV = (process.env.NEXT_PUBLIC_NETWORK_ENV ?? 'development') as
  | 'mainnet'
  | 'testnet'
  | 'development';

export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return NETWORK_CONFIGS[chainId];
}

export function isSupportedChain(chainId: number): boolean {
  return ALL_SUPPORTED_CHAIN_IDS.includes(chainId as (typeof ALL_SUPPORTED_CHAIN_IDS)[number]);
}

export function isActiveChain(chainId: number): boolean {
  if (NETWORK_ENV === 'mainnet') {
    return SUPPORTED_MAINNET_CHAIN_IDS.includes(
      chainId as (typeof SUPPORTED_MAINNET_CHAIN_IDS)[number],
    );
  }
  if (NETWORK_ENV === 'testnet') {
    return SUPPORTED_TESTNET_CHAIN_IDS.includes(
      chainId as (typeof SUPPORTED_TESTNET_CHAIN_IDS)[number],
    );
  }
  return chainId === hardhat.id;
}

export function getActiveChains(): NetworkConfig[] {
  if (NETWORK_ENV === 'mainnet') {
    return SUPPORTED_MAINNET_CHAIN_IDS.map((id) => NETWORK_CONFIGS[id]);
  }
  if (NETWORK_ENV === 'testnet') {
    return SUPPORTED_TESTNET_CHAIN_IDS.map((id) => NETWORK_CONFIGS[id]).filter(Boolean);
  }
  return [NETWORK_CONFIGS[hardhat.id]];
}

export function getExplorerAddressUrl(chainId: number, address: string): string {
  const cfg = NETWORK_CONFIGS[chainId];
  if (!cfg?.explorer) return '';
  return `${cfg.explorer}/address/${address}`;
}

export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const cfg = NETWORK_CONFIGS[chainId];
  if (!cfg?.explorer) return '';
  return `${cfg.explorer}/tx/${txHash}`;
}
