function envAddr(key: string): `0x${string}` {
  const val = process.env[key];
  if (val && /^0x[0-9a-fA-F]{40}$/.test(val)) return val as `0x${string}`;
  return '0x0000000000000000000000000000000000000000';
}

export const CONTRACT_ADDRESSES = {
  hardhat: {
    MTAToken:    '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
    MTAVesting:  '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
    MTATimelock: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788' as `0x${string}`,
    MTAGovernor: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e' as `0x${string}`,
    MTAStaking:  '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1' as `0x${string}`,
  },
  sepolia: {
    MTAToken:    envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_TOKEN_ADDRESS'),
    MTAVesting:  envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_VESTING_ADDRESS'),
    MTAStaking:  envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_STAKING_ADDRESS'),
    MTAGovernor: envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_GOVERNOR_ADDRESS'),
    MTATimelock: envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_TIMELOCK_ADDRESS'),
  },
  bscTestnet: {
    MTAToken:    envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_TOKEN_ADDRESS'),
    MTAVesting:  envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_VESTING_ADDRESS'),
    MTAStaking:  envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_STAKING_ADDRESS'),
    MTAGovernor: envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_GOVERNOR_ADDRESS'),
    MTATimelock: envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_TIMELOCK_ADDRESS'),
  },
  mainnet: {
    MTAToken:    envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_TOKEN_ADDRESS'),
    MTAVesting:  envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_VESTING_ADDRESS'),
    MTAStaking:  envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_STAKING_ADDRESS'),
    MTAGovernor: envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_GOVERNOR_ADDRESS'),
    MTATimelock: envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_TIMELOCK_ADDRESS'),
  },
  bsc: {
    MTAToken:    envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_TOKEN_ADDRESS'),
    MTAVesting:  envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_VESTING_ADDRESS'),
    MTAStaking:  envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_STAKING_ADDRESS'),
    MTAGovernor: envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_GOVERNOR_ADDRESS'),
    MTATimelock: envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_TIMELOCK_ADDRESS'),
  },
};

export const SUPPORTED_CHAIN_IDS = [1, 11155111, 56, 97, 31337] as const;

export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 1:        return CONTRACT_ADDRESSES.mainnet;
    case 56:       return CONTRACT_ADDRESSES.bsc;
    case 11155111: return CONTRACT_ADDRESSES.sepolia;
    case 97:       return CONTRACT_ADDRESSES.bscTestnet;
    case 31337:    return CONTRACT_ADDRESSES.hardhat;
    default:       return CONTRACT_ADDRESSES.hardhat;
  }
}
