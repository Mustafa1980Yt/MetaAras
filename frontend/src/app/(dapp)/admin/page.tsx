'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits, keccak256, toBytes } from 'viem';
import toast from 'react-hot-toast';
import {
  ShieldAlert, Pause, Play, Users, Settings,
  RefreshCw, AlertTriangle, CheckCircle, XCircle, Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { getContractAddresses } from '@/constants/contracts';
import { formatTokenAmount } from '@/utils/format';

const TOKEN_ABI = [
  { name: 'paused',           type: 'function', stateMutability: 'view',         inputs: [],                                                                                                       outputs: [{ type: 'bool' }] },
  { name: 'pause',            type: 'function', stateMutability: 'nonpayable',   inputs: [],                                                                                                       outputs: [] },
  { name: 'unpause',          type: 'function', stateMutability: 'nonpayable',   inputs: [],                                                                                                       outputs: [] },
  { name: 'hasRole',          type: 'function', stateMutability: 'view',         inputs: [{ name: 'role', type: 'bytes32' }, { name: 'account', type: 'address' }],                               outputs: [{ type: 'bool' }] },
  { name: 'setBlacklist',     type: 'function', stateMutability: 'nonpayable',   inputs: [{ name: 'account', type: 'address' }, { name: 'status', type: 'bool' }],                               outputs: [] },
  { name: 'isBlacklisted',    type: 'function', stateMutability: 'view',         inputs: [{ name: 'account', type: 'address' }],                                                                  outputs: [{ type: 'bool' }] },
  { name: 'isMintingDisabled',type: 'function', stateMutability: 'view',         inputs: [],                                                                                                       outputs: [{ type: 'bool' }] },
  { name: 'totalSupply',      type: 'function', stateMutability: 'view',         inputs: [],                                                                                                       outputs: [{ type: 'uint256' }] },
] as const;

const STAKING_ABI = [
  { name: 'paused',              type: 'function', stateMutability: 'view',       inputs: [],                                                                     outputs: [{ type: 'bool' }] },
  { name: 'pause',               type: 'function', stateMutability: 'nonpayable', inputs: [],                                                                     outputs: [] },
  { name: 'unpause',             type: 'function', stateMutability: 'nonpayable', inputs: [],                                                                     outputs: [] },
  { name: 'globalTotalStaked',   type: 'function', stateMutability: 'view',       inputs: [],                                                                     outputs: [{ type: 'uint256' }] },
  { name: 'totalPenaltiesCollected', type: 'function', stateMutability: 'view',   inputs: [],                                                                     outputs: [{ type: 'uint256' }] },
  { name: 'rewardsPool',         type: 'function', stateMutability: 'view',       inputs: [],                                                                     outputs: [{ type: 'address' }] },
  { name: 'hasRole',             type: 'function', stateMutability: 'view',       inputs: [{ name: 'role', type: 'bytes32' }, { name: 'account', type: 'address' }], outputs: [{ type: 'bool' }] },
] as const;

const DEFAULT_ADMIN = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;
const PAUSER_ROLE   = keccak256(toBytes('PAUSER_ROLE'))   as `0x${string}`;
const BLACKLISTER   = keccak256(toBytes('BLACKLISTER_ROLE')) as `0x${string}`;
const MINTER_ROLE   = keccak256(toBytes('MINTER_ROLE'))   as `0x${string}`;

function RoleBadge({ has }: { has: boolean | undefined }) {
  if (has === undefined) return <span className="text-xs text-[var(--text-muted)]">—</span>;
  return has
    ? <Badge variant="success" dot>Granted</Badge>
    : <Badge variant="danger">Not Granted</Badge>;
}

export default function AdminPage() {
  const chainId   = useChainId();
  const { address, isConnected } = useAccount();
  const addrs     = getContractAddresses(chainId);
  const tokenAddr = addrs.MTAToken   as `0x${string}`;
  const stakeAddr = addrs.MTAStaking as `0x${string}`;

  const [blacklistTarget, setBlacklistTarget] = useState('');

  const { writeContract, isPending } = useWriteContract();

  // Token state
  const { data: tokenPaused }    = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'paused' });
  const { data: mintDisabled }   = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'isMintingDisabled' });
  const { data: totalSupply }    = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'totalSupply' });

  // Staking state
  const { data: stakePaused }    = useReadContract({ address: stakeAddr, abi: STAKING_ABI, functionName: 'paused' });
  const { data: globalStaked }   = useReadContract({ address: stakeAddr, abi: STAKING_ABI, functionName: 'globalTotalStaked' });
  const { data: penalties }      = useReadContract({ address: stakeAddr, abi: STAKING_ABI, functionName: 'totalPenaltiesCollected' });
  const { data: rewardsPool }    = useReadContract({ address: stakeAddr, abi: STAKING_ABI, functionName: 'rewardsPool' });

  // Roles (of connected wallet)
  const { data: isAdmin }        = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'hasRole', args: address ? [DEFAULT_ADMIN, address] : undefined, query: { enabled: !!address } });
  const { data: isPauser }       = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'hasRole', args: address ? [PAUSER_ROLE, address] : undefined, query: { enabled: !!address } });
  const { data: isBlacklister }  = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'hasRole', args: address ? [BLACKLISTER, address] : undefined, query: { enabled: !!address } });
  const { data: isMinter }       = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'hasRole', args: address ? [MINTER_ROLE, address] : undefined, query: { enabled: !!address } });
  const { data: stakeAdmin }     = useReadContract({ address: stakeAddr, abi: STAKING_ABI, functionName: 'hasRole', args: address ? [DEFAULT_ADMIN, address] : undefined, query: { enabled: !!address } });
  const { data: stakePauser }    = useReadContract({ address: stakeAddr, abi: STAKING_ABI, functionName: 'hasRole', args: address ? [PAUSER_ROLE, address] : undefined, query: { enabled: !!address } });

  // Blacklist check
  const { data: targetBlacklisted } = useReadContract({
    address: tokenAddr, abi: TOKEN_ABI, functionName: 'isBlacklisted',
    args: (blacklistTarget as `0x${string}`) && blacklistTarget.startsWith('0x') && blacklistTarget.length === 42 ? [blacklistTarget as `0x${string}`] : undefined,
    query: { enabled: blacklistTarget.length === 42 },
  });

  const tx = (contractAddr: `0x${string}`, abi: typeof TOKEN_ABI | typeof STAKING_ABI, fn: string, args: unknown[] = []) =>
    writeContract(
      { address: contractAddr, abi: abi as any, functionName: fn, args } as any,
      { onSuccess: () => toast.success(`${fn} submitted!`), onError: e => toast.error(e.message.slice(0, 80)) },
    );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert className="w-16 h-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Admin Panel</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
          Connect a wallet with admin roles to access protocol controls.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Panel</h1>
          <p className="text-sm text-[var(--text-muted)]">Protocol management · Role-gated operations</p>
        </div>
        <div className="ml-auto">
          <Badge variant={isAdmin ? 'danger' : 'default'} dot={!!isAdmin}>
            {isAdmin ? 'Admin Access' : 'Read-Only'}
          </Badge>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Token Paused"   value={tokenPaused ? 'YES' : 'NO'}   icon={tokenPaused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />} accentColor={tokenPaused ? '#ef4444' : '#34d399'} />
        <StatCard label="Staking Paused" value={stakePaused ? 'YES' : 'NO'}   icon={stakePaused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />} accentColor={stakePaused ? '#ef4444' : '#34d399'} />
        <StatCard label="Total Supply"   value={totalSupply ? `${formatTokenAmount(totalSupply, 18, 0)} MTA` : '—'} icon={<Settings className="w-5 h-5" />} accentColor="#6366f1" />
        <StatCard label="Minting"        value={mintDisabled ? 'DISABLED' : 'ACTIVE'}   icon={mintDisabled ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />} accentColor={mintDisabled ? '#34d399' : '#f59e0b'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Token controls */}
        <Card>
          <CardHeader>
            <CardTitle>MTAToken Controls</CardTitle>
            <Badge variant={tokenPaused ? 'danger' : 'success'} dot>{tokenPaused ? 'Paused' : 'Active'}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-xl bg-[var(--surface-2)] text-sm">
              <div className="flex justify-between mb-1"><span className="text-[var(--text-muted)]">Contract</span><span className="font-mono text-brand-400 text-xs">{tokenAddr.slice(0, 10)}…</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Minting</span><span className={mintDisabled ? 'text-emerald-400' : 'text-red-400'}>{mintDisabled ? 'Permanently Disabled' : 'Active'}</span></div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary" fullWidth onClick={() => tx(tokenAddr, TOKEN_ABI, 'pause')} loading={isPending}
                disabled={!isPauser || !!tokenPaused}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
              >
                <Pause className="w-4 h-4" /> Pause Token
              </Button>
              <Button
                variant="secondary" fullWidth onClick={() => tx(tokenAddr, TOKEN_ABI, 'unpause')} loading={isPending}
                disabled={!isPauser || !tokenPaused}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40"
              >
                <Play className="w-4 h-4" /> Unpause Token
              </Button>
            </div>
            {!isPauser && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Your wallet does not have PAUSER_ROLE on MTAToken
              </p>
            )}
          </CardContent>
        </Card>

        {/* Staking controls */}
        <Card>
          <CardHeader>
            <CardTitle>MTAStaking Controls</CardTitle>
            <Badge variant={stakePaused ? 'danger' : 'success'} dot>{stakePaused ? 'Paused' : 'Active'}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-xl bg-[var(--surface-2)] text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Global Staked</span><span className="font-semibold text-[var(--text-primary)]">{globalStaked ? `${formatTokenAmount(globalStaked, 18, 2)} MTA` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Penalties Collected</span><span className="font-semibold text-[var(--text-primary)]">{penalties ? `${formatTokenAmount(penalties, 18, 4)} MTA` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Rewards Pool</span><span className="font-mono text-brand-400 text-xs">{rewardsPool ? `${rewardsPool.slice(0, 10)}…` : '—'}</span></div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary" fullWidth onClick={() => tx(stakeAddr, STAKING_ABI, 'pause')} loading={isPending}
                disabled={!stakePauser || !!stakePaused}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
              >
                <Pause className="w-4 h-4" /> Pause Staking
              </Button>
              <Button
                variant="secondary" fullWidth onClick={() => tx(stakeAddr, STAKING_ABI, 'unpause')} loading={isPending}
                disabled={!stakePauser || !stakePaused}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40"
              >
                <Play className="w-4 h-4" /> Unpause Staking
              </Button>
            </div>
            {!stakePauser && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Your wallet does not have PAUSER_ROLE on MTAStaking
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Roles of connected wallet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Your Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="text-xs text-[var(--text-muted)] mb-2">Connected: <span className="font-mono text-brand-400">{address?.slice(0, 10)}…</span></p>
              {[
                { label: 'MTAToken · DEFAULT_ADMIN',     has: isAdmin },
                { label: 'MTAToken · PAUSER_ROLE',       has: isPauser },
                { label: 'MTAToken · BLACKLISTER_ROLE',  has: isBlacklister },
                { label: 'MTAToken · MINTER_ROLE',       has: isMinter },
                { label: 'MTAStaking · DEFAULT_ADMIN',   has: stakeAdmin },
                { label: 'MTAStaking · PAUSER_ROLE',     has: stakePauser },
              ].map(({ label, has }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">{label}</span>
                  <RoleBadge has={has} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blacklist tool */}
        <Card>
          <CardHeader>
            <CardTitle>Blacklist Management</CardTitle>
            {!isBlacklister && <Badge variant="default">No BLACKLISTER_ROLE</Badge>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] block mb-1.5">Target Address</label>
              <input
                value={blacklistTarget}
                onChange={e => setBlacklistTarget(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {blacklistTarget.length === 42 && (
                <p className="text-xs mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span className={targetBlacklisted ? 'text-red-400' : 'text-emerald-400'}>
                    {targetBlacklisted ? 'Currently blacklisted' : 'Not blacklisted'}
                  </span>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary" fullWidth
                onClick={() => tx(tokenAddr, TOKEN_ABI, 'setBlacklist', [blacklistTarget as `0x${string}`, true])}
                loading={isPending} disabled={!isBlacklister || blacklistTarget.length !== 42 || !!targetBlacklisted}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
              >
                Blacklist
              </Button>
              <Button
                variant="secondary" fullWidth
                onClick={() => tx(tokenAddr, TOKEN_ABI, 'setBlacklist', [blacklistTarget as `0x${string}`, false])}
                loading={isPending} disabled={!isBlacklister || blacklistTarget.length !== 42 || !targetBlacklisted}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40"
              >
                Remove Blacklist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security notice */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Security Notice</p>
            <p className="text-xs text-amber-400/80 mt-1">
              Admin operations are irreversible on-chain. All pause/unpause and blacklist actions
              are logged on the blockchain. Governance timelock delays apply to tier changes and upgrades.
              Admin actions here bypass timelock — use with extreme caution.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
