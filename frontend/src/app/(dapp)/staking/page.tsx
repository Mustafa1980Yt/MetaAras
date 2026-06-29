'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther, formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { Zap, Lock, TrendingUp, Clock, AlertCircle, Award, RefreshCw, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { STAKING_TIERS } from '@/constants/tokenomics';
import { formatNumber, formatDuration, formatDate } from '@/utils/format';
import { useTokenData, useStakingData } from '@/hooks/useTokenData';

const TIER_ENUM = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 3 } as const;
const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const;
const TIER_COLORS = { Bronze: '#cd7f32', Silver: '#9ca3af', Gold: '#eab308', Platinum: '#6366f1' };

const TOKEN_ABI = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const;

const STAKING_ABI = [
  { name: 'stake',          type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }, { name: 'tier', type: 'uint8' }], outputs: [] },
  { name: 'unstake',        type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'positionId', type: 'uint256' }], outputs: [] },
  { name: 'claimRewards',   type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'positionId', type: 'uint256' }], outputs: [] },
  { name: 'compound',       type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'positionId', type: 'uint256' }], outputs: [] },
  { name: 'getPosition',    type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }, { name: 'positionId', type: 'uint256' }], outputs: [{
    type: 'tuple', components: [
      { name: 'amount',         type: 'uint256' },
      { name: 'claimedRewards', type: 'uint256' },
      { name: 'startTime',      type: 'uint48' },
      { name: 'unlockTime',     type: 'uint48' },
      { name: 'lastClaimTime',  type: 'uint48' },
      { name: 'tier',           type: 'uint8' },
      { name: 'active',         type: 'bool' },
    ],
  }]},
  { name: 'pendingRewards', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }, { name: 'positionId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
] as const;

function PositionCard({
  positionId, stakingAddress, userAddress,
}: { positionId: number; stakingAddress: `0x${string}`; userAddress: `0x${string}` }) {
  const { data: pos }     = useReadContract({ address: stakingAddress, abi: STAKING_ABI, functionName: 'getPosition',    args: [userAddress, BigInt(positionId)] });
  const { data: pending } = useReadContract({ address: stakingAddress, abi: STAKING_ABI, functionName: 'pendingRewards', args: [userAddress, BigInt(positionId)], query: { refetchInterval: 15_000 } });

  const { writeContract, isPending } = useWriteContract();

  if (!pos) return <Skeleton className="h-44" />;
  if (!pos.active) return null;

  const now      = Math.floor(Date.now() / 1000);
  const unlocked = now >= Number(pos.unlockTime);
  const tierName = TIER_NAMES[pos.tier] ?? 'Unknown';
  const tierColor = TIER_COLORS[tierName as keyof typeof TIER_COLORS] ?? '#6366f1';
  const tierInfo  = STAKING_TIERS.find(t => t.name === tierName);
  const elapsed   = now - Number(pos.startTime);
  const total     = Number(pos.unlockTime) - Number(pos.startTime);
  const progress  = Math.min(100, Math.floor((elapsed / total) * 100));

  const call = (fn: 'claimRewards' | 'unstake' | 'compound') =>
    writeContract(
      { address: stakingAddress, abi: STAKING_ABI, functionName: fn, args: [BigInt(positionId)] },
      {
        onSuccess: () => toast.success(`${fn === 'claimRewards' ? 'Claim' : fn === 'compound' ? 'Compound' : 'Unstake'} submitted!`),
        onError:   (e) => toast.error(e.message.slice(0, 60)),
      },
    );

  function handleUnstake() {
    if (!unlocked) {
      const confirmed = window.confirm(
        '⚠️ Early Exit Warning\n\nYour lock period has not ended yet.\n' +
        'Unstaking now will incur a 20% penalty on your principal.\n\n' +
        'Are you sure you want to exit early?'
      );
      if (!confirmed) return;
    }
    call('unstake');
  }

  return (
    <Card glow className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: tierColor }} />
      <div className="flex items-start justify-between mb-4 pt-1">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Position #{positionId}</p>
          <Badge variant="brand" className="mt-1" style={{ color: tierColor, borderColor: `${tierColor}40`, background: `${tierColor}15` }}>
            {tierName}
          </Badge>
        </div>
        <Badge variant={unlocked ? 'success' : 'warning'} dot>
          {unlocked ? 'Unlocked' : 'Locked'}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
          <span>Lock progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: tierColor }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Staked</p>
          <p className="font-bold text-[var(--text-primary)]">{parseFloat(formatUnits(pos.amount, 18)).toLocaleString()} MTA</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">APY</p>
          <p className="font-bold" style={{ color: tierColor }}>{tierInfo?.apy ?? '?'}%</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">Pending Reward</p>
          <p className="font-bold text-emerald-400">
            {pending !== undefined ? `+${parseFloat(formatUnits(pending, 18)).toFixed(4)} MTA` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">Unlocks</p>
          <p className="text-[var(--text-secondary)]">{formatDate(Number(pos.unlockTime))}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => call('claimRewards')} loading={isPending} className="flex-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
          <Award className="w-3.5 h-3.5" /> Claim
        </Button>
        <Button variant="secondary" size="sm" onClick={() => call('compound')} loading={isPending} className="flex-1 text-brand-400 border-brand-500/30 hover:bg-brand-500/10">
          <RefreshCw className="w-3.5 h-3.5" /> Compound
        </Button>
        <Button
          variant="secondary" size="sm" onClick={handleUnstake} loading={isPending}
          className={`flex-1 border-red-500/30 hover:bg-red-500/10 ${unlocked ? 'text-red-400' : 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'}`}
        >
          <LogOut className="w-3.5 h-3.5" /> {unlocked ? 'Unstake' : 'Exit (−20%)'}
        </Button>
      </div>
    </Card>
  );
}

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const { userBalance, tokenAddress } = useTokenData();
  const { globalTotalStaked, positionCount, stakingAddress } = useStakingData();

  const [selectedTier, setSelectedTier] = useState<keyof typeof TIER_ENUM>('Bronze');
  const [amount, setAmount]   = useState('');
  const [tab, setTab]         = useState<'stake' | 'positions'>('stake');

  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: address && stakingAddress ? [address, stakingAddress] : undefined,
    query: { enabled: !!address && !!stakingAddress, refetchInterval: 10_000 },
  });

  const { writeContract: approveToken,  isPending: isApproving  } = useWriteContract();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const tier = STAKING_TIERS.find(t => t.name === selectedTier)!;
  const amountBig = amount ? parseEther(amount) : BigInt(0);
  const projectedReward = amount ? (parseFloat(amount) * tier.apy) / 100 : 0;
  const needsApproval   = allowance !== undefined && amountBig > BigInt(0) && allowance < amountBig;

  function handleApprove() {
    const MAX = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    approveToken(
      { address: tokenAddress, abi: TOKEN_ABI, functionName: 'approve', args: [stakingAddress, MAX] },
      { onSuccess: () => toast.success('Approval confirmed!'), onError: e => toast.error(e.message.slice(0, 60)) },
    );
  }

  function handleStake() {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    writeContract(
      { address: stakingAddress, abi: [{ name: 'stake', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }, { name: 'tier', type: 'uint8' }], outputs: [] }] as const, functionName: 'stake', args: [amountBig, TIER_ENUM[selectedTier]] },
      { onSuccess: () => { toast.success('Stake submitted!'); setAmount(''); }, onError: e => toast.error(e.message.slice(0, 60)) },
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Zap className="w-16 h-16 text-brand-400 mb-6" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Connect Wallet to Stake</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
          Lock MTA tokens to earn up to 40% APY across four staking tiers.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Staking</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Lock MTA tokens to earn fixed APY rewards</p>
        </div>
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden text-sm font-medium">
          <button onClick={() => setTab('stake')} className={`px-4 py-2 transition-colors ${tab === 'stake' ? 'bg-brand-500 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'}`}>New Stake</button>
          <button onClick={() => setTab('positions')} className={`px-4 py-2 transition-colors ${tab === 'positions' ? 'bg-brand-500 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'}`}>
            My Positions {positionCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-xs">{positionCount}</span>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Your Balance"    value={`${userBalance} MTA`}              icon={<Zap className="w-5 h-5" />}       accentColor="#6366f1" />
        <StatCard label="Global TVL"      value={`${globalTotalStaked ?? '—'} MTA`} icon={<Lock className="w-5 h-5" />}      accentColor="#22d3ee" loading={!globalTotalStaked} />
        <StatCard label="Active Positions" value={String(positionCount)}            icon={<TrendingUp className="w-5 h-5" />} accentColor="#a78bfa" />
      </div>

      {/* Tab: New Stake */}
      {tab === 'stake' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Select Tier</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {STAKING_TIERS.map(t => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTier(t.name)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedTier === t.name ? 'border-brand-500 bg-brand-500/5' : 'border-[var(--border)] bg-[var(--surface-1)] hover:border-brand-500/40'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[var(--text-primary)]">{t.name}</span>
                    <span className="text-xl font-extrabold" style={{ color: t.color }}>{t.apy}%</span>
                  </div>
                  <div className="space-y-1 text-xs text-[var(--text-muted)]">
                    <div className="flex justify-between"><span>Lock period</span><span className="text-[var(--text-secondary)]">{formatDuration(t.lockDays)}</span></div>
                    <div className="flex justify-between"><span>Minimum</span><span className="text-[var(--text-secondary)]">{formatNumber(t.minAmount)} MTA</span></div>
                  </div>
                </button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stake MTA</CardTitle>
                <Badge variant="brand">{selectedTier} · {tier.apy}% APY</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[var(--text-primary)]">Amount</label>
                    <button onClick={() => setAmount(userBalance?.split(' ')[0] ?? '')} className="text-xs text-brand-400 hover:text-brand-300">
                      Max: {userBalance}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder={`Min ${formatNumber(tier.minAmount)}`}
                      className="w-full px-4 py-3 pr-16 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">MTA</span>
                  </div>
                </div>

                {projectedReward > 0 && (
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-2 text-sm">
                    <div className="flex justify-between text-[var(--text-secondary)]"><span>Lock period</span><span className="font-medium text-[var(--text-primary)]">{formatDuration(tier.lockDays)}</span></div>
                    <div className="flex justify-between text-[var(--text-secondary)]"><span>APY</span><span className="font-medium" style={{ color: tier.color }}>{tier.apy}%</span></div>
                    <div className="flex justify-between text-[var(--text-secondary)]"><span>Projected reward</span><span className="font-bold text-emerald-400">+{formatNumber(projectedReward)} MTA</span></div>
                    <div className="flex justify-between text-[var(--text-secondary)]"><span>Early exit penalty</span><span className="text-red-400">20% of principal</span></div>
                  </div>
                )}

                {needsApproval ? (
                  <Button fullWidth onClick={handleApprove} loading={isApproving}>
                    <Zap className="w-4 h-4" /> Approve MTA Spending
                  </Button>
                ) : (
                  <Button fullWidth onClick={handleStake} loading={isPending || isConfirming} disabled={!amount || parseFloat(amount) <= 0}>
                    <Lock className="w-4 h-4" />
                    {isPending ? 'Confirm in wallet...' : isConfirming ? 'Confirming...' : `Stake ${selectedTier}`}
                  </Button>
                )}
                <p className="text-xs text-[var(--text-muted)] text-center">Early exit penalty: 20% of principal. Rewards always paid in full.</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>How Staking Works</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
                  {['Approve MTA spending (once per session)', 'Choose a tier and enter amount', 'Confirm stake transaction', 'Rewards accrue every second on-chain', 'Claim or compound anytime', 'Unstake after lock period ends'].map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20 bg-amber-500/5">
              <div className="flex gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300/90">Smart contracts are in pre-audit stage. Stake at your own risk.</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: My Positions */}
      {tab === 'positions' && (
        <div>
          {positionCount === 0 ? (
            <Card className="text-center py-16">
              <Zap className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">No Active Positions</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">You don&apos;t have any staking positions yet.</p>
              <Button onClick={() => setTab('stake')} size="sm"><Zap className="w-4 h-4" /> Start Staking</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: positionCount }, (_, i) => (
                <PositionCard key={i} positionId={i} stakingAddress={stakingAddress} userAddress={address!} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
