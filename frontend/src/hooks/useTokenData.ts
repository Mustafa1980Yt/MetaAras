'use client';

import { useReadContract, useBalance, useAccount, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { getContractAddresses } from '@/constants/contracts';
import { formatTokenAmount } from '@/utils/format';

const MTA_ABI = [
  { name: 'totalSupply',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'MAX_SUPPLY',       type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'circulatingSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'isMintingDisabled', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'balanceOf',        type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'getVotes',         type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'paused',           type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
] as const;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function isValidAddress(addr: string): addr is `0x${string}` {
  return !!addr && addr !== ZERO_ADDRESS;
}

export function useTokenData() {
  const chainId   = useChainId();
  const { address } = useAccount();

  const addresses = getContractAddresses(chainId);
  const tokenAddress = addresses.MTAToken as `0x${string}`;
  const enabled = isValidAddress(tokenAddress);

  const { data: totalSupply }       = useReadContract({ address: tokenAddress, abi: MTA_ABI, functionName: 'totalSupply',       query: { enabled } });
  const { data: maxSupply }         = useReadContract({ address: tokenAddress, abi: MTA_ABI, functionName: 'MAX_SUPPLY',        query: { enabled } });
  const { data: circulatingSupply } = useReadContract({ address: tokenAddress, abi: MTA_ABI, functionName: 'circulatingSupply', query: { enabled } });
  const { data: mintingDisabled }   = useReadContract({ address: tokenAddress, abi: MTA_ABI, functionName: 'isMintingDisabled', query: { enabled } });
  const { data: paused }            = useReadContract({ address: tokenAddress, abi: MTA_ABI, functionName: 'paused',            query: { enabled } });
  const { data: userBalance }       = useReadContract({ address: tokenAddress, abi: MTA_ABI, functionName: 'balanceOf', args: address ? [address] : undefined, query: { enabled: enabled && !!address } });
  const { data: userVotes }         = useReadContract({ address: tokenAddress, abi: MTA_ABI, functionName: 'getVotes',  args: address ? [address] : undefined, query: { enabled: enabled && !!address } });

  return {
    totalSupply:        totalSupply  ? formatTokenAmount(totalSupply,  18, 2) : undefined,
    maxSupply:          maxSupply    ? formatTokenAmount(maxSupply,    18, 2) : undefined,
    circulatingSupply:  circulatingSupply ? formatTokenAmount(circulatingSupply, 18, 2) : undefined,
    mintingDisabled:    mintingDisabled ?? undefined,
    paused:             paused ?? undefined,
    userBalance:        userBalance  ? formatTokenAmount(userBalance,  18, 4) : '0',
    userVotes:          userVotes    ? formatTokenAmount(userVotes,    18, 4) : '0',
    tokenAddress,
  };
}

export function useStakingData() {
  const chainId = useChainId();
  const { address } = useAccount();

  const addresses = getContractAddresses(chainId);
  const stakingAddress = addresses.MTAStaking as `0x${string}`;

  const STAKING_ABI = [
    { name: 'globalTotalStaked',       type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
    { name: 'totalPenaltiesCollected', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
    { name: 'positionCount',           type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  ] as const;

  const enabled = isValidAddress(stakingAddress);

  const { data: globalStaked }   = useReadContract({ address: stakingAddress, abi: STAKING_ABI, functionName: 'globalTotalStaked',       query: { enabled } });
  const { data: totalPenalties } = useReadContract({ address: stakingAddress, abi: STAKING_ABI, functionName: 'totalPenaltiesCollected', query: { enabled } });
  const { data: posCount }       = useReadContract({ address: stakingAddress, abi: STAKING_ABI, functionName: 'positionCount', args: address ? [address] : undefined, query: { enabled: enabled && !!address } });

  return {
    globalTotalStaked:       globalStaked   ? formatTokenAmount(globalStaked,   18, 2) : undefined,
    totalPenaltiesCollected: totalPenalties ? formatTokenAmount(totalPenalties, 18, 2) : undefined,
    positionCount:           posCount !== undefined ? Number(posCount) : 0,
    stakingAddress,
  };
}
