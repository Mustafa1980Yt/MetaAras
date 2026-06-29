'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { Zap, Lock, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { STAKING_TIERS } from '@/constants/tokenomics';
import { formatNumber, formatDuration } from '@/utils/format';
import { useTokenData, useStakingData } from '@/hooks/useTokenData';

const TIER_ENUM = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 3 } as const;

const STAKING_ABI = [
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'tier',   type: 'uint8' },
    ],
    outputs: [],
  },
] as const;

export default function StakingPage() {
  const { isConnected } = useAccount();
  const { userBalance } = useTokenData();
  const { globalTotalStaked, stakingAddress } = useStakingData();

  const [selectedTier, setSelectedTier] = useState<keyof typeof TIER_ENUM>('Bronze');
  const [amount, setAmount] = useState('');

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const tier = STAKING_TIERS.find(t => t.name === selectedTier)!;
  const projectedReward = amount ? (parseFloat(amount) * tier.apy) / 100 : 0;

  function handleStake() {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    writeContract(
      {
        address: stakingAddress,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [parseEther(amount), TIER_ENUM[selectedTier]],
      },
      {
        onSuccess: () => toast.success('Stake transaction submitted!'),
        onError: (e) => toast.error(e.message.slice(0, 60)),
      },
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Staking</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Lock MTA tokens to earn fixed APY rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Your Balance"   value={`${userBalance} MTA`}           icon={<Zap className="w-5 h-5" />} accentColor="#6366f1" />
        <StatCard label="Global TVL"     value={`${globalTotalStaked ?? '—'} MTA`} icon={<Lock className="w-5 h-5" />} accentColor="#22d3ee" loading={!globalTotalStaked} />
        <StatCard label="Max APY"        value="40%"                             icon={<TrendingUp className="w-5 h-5" />} accentColor="#a78bfa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier selector */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Select Tier</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {STAKING_TIERS.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedTier(t.name)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedTier === t.name
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-[var(--border)] bg-[var(--surface-1)] hover:border-brand-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[var(--text-primary)]">{t.name}</span>
                  <span className="text-xl font-extrabold" style={{ color: t.color }}>{t.apy}%</span>
                </div>
                <div className="space-y-1 text-xs text-[var(--text-muted)]">
                  <div className="flex justify-between">
                    <span>Lock period</span>
                    <span className="text-[var(--text-secondary)]">{formatDuration(t.lockDays)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum</span>
                    <span className="text-[var(--text-secondary)]">{formatNumber(t.minAmount)} MTA</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Stake form */}
          <Card>
            <CardHeader>
              <CardTitle>Stake MTA</CardTitle>
              <Badge variant="brand">{selectedTier} · {tier.apy}% APY</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Amount</label>
                  <button
                    onClick={() => setAmount(userBalance?.split(' ')[0] ?? '')}
                    className="text-xs text-brand-400 hover:text-brand-300"
                  >
                    Max: {userBalance}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder={`Min ${formatNumber(tier.minAmount)}`}
                    className="w-full px-4 py-3 pr-16 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">MTA</span>
                </div>
              </div>

              {/* Projection */}
              {projectedReward > 0 && (
                <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Lock period</span>
                    <span className="font-medium text-[var(--text-primary)]">{formatDuration(tier.lockDays)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>APY</span>
                    <span className="font-medium" style={{ color: tier.color }}>{tier.apy}%</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Projected reward</span>
                    <span className="font-bold text-emerald-400">+{formatNumber(projectedReward)} MTA</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Early exit penalty</span>
                    <span className="text-red-400">20% of principal</span>
                  </div>
                </div>
              )}

              <Button
                fullWidth
                onClick={handleStake}
                loading={isPending || isConfirming}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                <Lock className="w-4 h-4" />
                {isPending ? 'Confirm in wallet...' : isConfirming ? 'Confirming...' : `Stake ${selectedTier}`}
              </Button>

              <p className="text-xs text-[var(--text-muted)] text-center">
                Early exit penalty: 20% of principal. Rewards always paid in full.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>How Staking Works</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
                {[
                  'Choose a tier and lock amount',
                  'Approve MTA for the staking contract',
                  'Confirm stake transaction',
                  'Rewards accrue every second',
                  'Claim or compound anytime',
                  'Unstake after lock period, penalty-free',
                ].map((step, i) => (
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
              <p className="text-sm text-amber-300/90">
                Stake on testnet first. Smart contracts are in pre-audit stage.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tier Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {STAKING_TIERS.map(t => (
                  <div key={t.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                    <span className="text-xs text-[var(--text-secondary)] flex-1">{t.name}</span>
                    <span className="text-xs font-bold" style={{ color: t.color }}>{t.apy}%</span>
                    <span className="text-xs text-[var(--text-muted)]">{formatDuration(t.lockDays)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
