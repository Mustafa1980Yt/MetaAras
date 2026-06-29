import MTATokenABI    from './MTAToken.abi.json';
import MTAStakingABI  from './MTAStaking.abi.json';
import MTAVestingABI  from './MTAVesting.abi.json';
import MTAGovernorABI from './MTAGovernor.abi.json';

export { MTATokenABI, MTAStakingABI, MTAVestingABI, MTAGovernorABI };

export const CHAIN_IDS = {
  mainnet:    1,
  sepolia:    11155111,
  bsc:        56,
  bscTestnet: 97,
  hardhat:    31337,
} as const;

// ── Hardhat local (static — from `npx hardhat node` deployment) ────────────
const HARDHAT_ADDRESSES = {
  MTAToken:    '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
  MTAVesting:  '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
  MTATimelock: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788' as `0x${string}`,
  MTAGovernor: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e' as `0x${string}`,
  MTAStaking:  '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1' as `0x${string}`,
};

function envAddr(key: string): `0x${string}` {
  const val = process.env[key];
  if (val && val.startsWith('0x') && val.length === 42) return val as `0x${string}`;
  return '0x0000000000000000000000000000000000000000';
}

// Each network reads from its own env var prefix so multiple chains can
// coexist in a single .env.local after running sync-env for each network.
export const DEPLOYED_ADDRESSES = {
  hardhat: HARDHAT_ADDRESSES,
  sepolia: {
    MTAToken:    envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_TOKEN_ADDRESS'),
    MTAStaking:  envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_STAKING_ADDRESS'),
    MTAVesting:  envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_VESTING_ADDRESS'),
    MTAGovernor: envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_GOVERNOR_ADDRESS'),
    MTATimelock: envAddr('NEXT_PUBLIC_ETH_SEPOLIA_MTA_TIMELOCK_ADDRESS'),
  },
  bscTestnet: {
    MTAToken:    envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_TOKEN_ADDRESS'),
    MTAStaking:  envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_STAKING_ADDRESS'),
    MTAVesting:  envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_VESTING_ADDRESS'),
    MTAGovernor: envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_GOVERNOR_ADDRESS'),
    MTATimelock: envAddr('NEXT_PUBLIC_BSC_TESTNET_MTA_TIMELOCK_ADDRESS'),
  },
  mainnet: {
    MTAToken:    envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_TOKEN_ADDRESS'),
    MTAStaking:  envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_STAKING_ADDRESS'),
    MTAVesting:  envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_VESTING_ADDRESS'),
    MTAGovernor: envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_GOVERNOR_ADDRESS'),
    MTATimelock: envAddr('NEXT_PUBLIC_ETH_MAINNET_MTA_TIMELOCK_ADDRESS'),
  },
  bsc: {
    MTAToken:    envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_TOKEN_ADDRESS'),
    MTAStaking:  envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_STAKING_ADDRESS'),
    MTAVesting:  envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_VESTING_ADDRESS'),
    MTAGovernor: envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_GOVERNOR_ADDRESS'),
    MTATimelock: envAddr('NEXT_PUBLIC_BSC_MAINNET_MTA_TIMELOCK_ADDRESS'),
  },
} as const;

export function getAddresses(chainId: number) {
  switch (chainId) {
    case CHAIN_IDS.mainnet:    return DEPLOYED_ADDRESSES.mainnet;
    case CHAIN_IDS.sepolia:    return DEPLOYED_ADDRESSES.sepolia;
    case CHAIN_IDS.bsc:        return DEPLOYED_ADDRESSES.bsc;
    case CHAIN_IDS.bscTestnet: return DEPLOYED_ADDRESSES.bscTestnet;
    case CHAIN_IDS.hardhat:    return DEPLOYED_ADDRESSES.hardhat;
    default:                   return DEPLOYED_ADDRESSES.hardhat;
  }
}

export function hasDeployedContracts(chainId: number): boolean {
  const addrs = getAddresses(chainId);
  return addrs.MTAToken !== '0x0000000000000000000000000000000000000000';
}

export function getTokenContract(chainId: number) {
  return { address: getAddresses(chainId).MTAToken, abi: MTATokenABI } as const;
}

export function getStakingContract(chainId: number) {
  return { address: getAddresses(chainId).MTAStaking, abi: MTAStakingABI } as const;
}

export function getVestingContract(chainId: number) {
  return { address: getAddresses(chainId).MTAVesting, abi: MTAVestingABI } as const;
}

export function getGovernorContract(chainId: number) {
  return { address: getAddresses(chainId).MTAGovernor, abi: MTAGovernorABI } as const;
}
