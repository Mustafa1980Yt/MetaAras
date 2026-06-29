'use client';

import { useReadContract, useChainId } from 'wagmi';
import { Shield, Vault, Clock, ExternalLink, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { getContractAddresses } from '@/constants/contracts';
import { formatTokenAmount } from '@/utils/format';
import { getExplorerAddressUrl } from '@/config/networks';

const TOKEN_ABI = [
  { name: 'totalSupply',       type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'isMintingDisabled', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'balanceOf',         type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const;

const STAKING_ABI = [
  { name: 'globalTotalStaked',         type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalPenaltiesCollected',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'rewardsPool',               type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const;

const VESTING_ABI = [
  { name: 'totalVestingAmount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'scheduleCount',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

// Static whitepaper allocation — these are design-time constants, not on-chain state
const ALLOCATIONS = [
  { label: 'Ecosystem Fund',    amount: '35,000,000', pct: 35, status: 'DAO-governed',   color: '#6366f1' },
  { label: 'Liquidity Pool',    amount: '20,000,000', pct: 20, status: 'DEX Pools',       color: '#22d3ee' },
  { label: 'Treasury Reserve',  amount: '15,000,000', pct: 15, status: 'Timelock-locked', color: '#34d399' },
  { label: 'Team (vested)',      amount: '15,000,000', pct: 15, status: '12m cliff / 36m', color: '#a78bfa' },
  { label: 'Seed (vested)',      amount: '10,000,000', pct: 10, status: '6m cliff / 18m',  color: '#f59e0b' },
  { label: 'Public Sale',        amount:  '5,000,000', pct:  5, status: 'TGE release',     color: '#f472b6' },
];

export default function TreasuryPage() {
  const chainId = useChainId();
  const addrs   = getContractAddresses(chainId);
  const tokenAddr   = addrs.MTAToken   as `0x${string}`;
  const stakingAddr = addrs.MTAStaking as `0x${string}`;
  const vestingAddr = addrs.MTAVesting as `0x${string}`;
  const timelockAddr = addrs.MTATimelock as `0x${string}`;

  const { data: totalSupply }   = useReadContract({ address: tokenAddr,   abi: TOKEN_ABI,   functionName: 'totalSupply' });
  const { data: mintDisabled }  = useReadContract({ address: tokenAddr,   abi: TOKEN_ABI,   functionName: 'isMintingDisabled' });
  const { data: globalStaked }  = useReadContract({ address: stakingAddr, abi: STAKING_ABI, functionName: 'globalTotalStaked' });
  const { data: penalties }     = useReadContract({ address: stakingAddr, abi: STAKING_ABI, functionName: 'totalPenaltiesCollected' });
  const { data: rewardsPool }   = useReadContract({ address: stakingAddr, abi: STAKING_ABI, functionName: 'rewardsPool' });
  const { data: totalVesting }  = useReadContract({ address: vestingAddr, abi: VESTING_ABI, functionName: 'totalVestingAmount' });
  const { data: scheduleCount } = useReadContract({ address: vestingAddr, abi: VESTING_ABI, functionName: 'scheduleCount' });
  const { data: timelockBal }   = useReadContract({ address: tokenAddr,   abi: TOKEN_ABI,   functionName: 'balanceOf', args: [timelockAddr] });

  const explorerUrl = getExplorerAddressUrl(chainId, timelockAddr);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Treasury</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          MetaAras DAO treasury · Live on-chain data
        </p>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Supply"
          value={totalSupply ? `${formatTokenAmount(totalSupply, 18, 0)} MTA` : '—'}
          icon={<Vault className="w-5 h-5" />}
          accentColor="#6366f1"
          loading={!totalSupply}
        />
        <StatCard
          label="Total Staked (TVL)"
          value={globalStaked ? `${formatTokenAmount(globalStaked, 18, 2)} MTA` : '—'}
          icon={<Shield className="w-5 h-5" />}
          accentColor="#34d399"
          loading={!globalStaked}
        />
        <StatCard
          label="Locked in Vesting"
          value={totalVesting ? `${formatTokenAmount(totalVesting, 18, 2)} MTA` : '—'}
          icon={<Clock className="w-5 h-5" />}
          accentColor="#a78bfa"
          loading={!totalVesting}
        />
        <StatCard
          label="Minting"
          value={mintDisabled === true ? 'Permanently Disabled' : mintDisabled === false ? 'Active' : '—'}
          icon={<Shield className="w-5 h-5" />}
          accentColor={mintDisabled ? '#34d399' : '#f59e0b'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Allocation breakdown — static (whitepaper) */}
        <Card>
          <CardHeader>
            <CardTitle>Token Allocation (Whitepaper)</CardTitle>
            <Badge variant="brand">100M MTA</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {ALLOCATIONS.map(a => (
              <div key={a.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{a.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">{a.status}</Badge>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{a.pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${a.pct * 2.85}%`, background: a.color }} />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 text-right">{a.amount} MTA</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* On-chain live metrics */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Staking Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: 'Global TVL',              value: globalStaked  ? `${formatTokenAmount(globalStaked,  18, 2)} MTA` : '—' },
                { label: 'Early Exit Penalties',    value: penalties     ? `${formatTokenAmount(penalties,     18, 4)} MTA` : '—' },
                { label: 'Rewards Pool',            value: rewardsPool   ? `${rewardsPool.slice(0, 10)}…`                  : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1 border-b border-[var(--border)] last:border-0">
                  <span className="text-[var(--text-muted)]">{label}</span>
                  <span className="font-medium text-[var(--text-primary)] font-mono text-xs">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Vesting & Timelock</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: 'Vesting Schedules',     value: scheduleCount !== undefined ? String(scheduleCount) : '—' },
                { label: 'Locked in Vesting',     value: totalVesting ? `${formatTokenAmount(totalVesting, 18, 2)} MTA` : '—' },
                { label: 'Timelock MTA Balance',  value: timelockBal  ? `${formatTokenAmount(timelockBal,  18, 2)} MTA` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1 border-b border-[var(--border)] last:border-0">
                  <span className="text-[var(--text-muted)]">{label}</span>
                  <span className="font-medium text-[var(--text-primary)]">{value}</span>
                </div>
              ))}
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Timelock on Explorer
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Governance notice */}
      <Card>
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">DAO Governance Controls Treasury</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              All treasury disbursements require a governance proposal, 4% quorum vote, and a 48-hour
              Timelock execution delay. No single entity can move treasury funds unilaterally.
              Transaction history is available on the block explorer linked above.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
