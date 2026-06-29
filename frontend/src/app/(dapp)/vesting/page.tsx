'use client';

import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Lock, Clock, TrendingDown, CheckCircle, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatTokenAmount, formatAddress } from '@/utils/format';
import { getContractAddresses } from '@/constants/contracts';
import toast from 'react-hot-toast';

const VESTING_ABI = [
  { name: 'getBeneficiarySchedules', type: 'function', stateMutability: 'view',       inputs: [{ name: 'beneficiary', type: 'address' }],                outputs: [{ type: 'bytes32[]' }] },
  { name: 'getSchedule',             type: 'function', stateMutability: 'view',       inputs: [{ name: 'scheduleId', type: 'bytes32' }],                 outputs: [{ type: 'tuple', components: [
    { name: 'beneficiary',     type: 'address' },
    { name: 'totalAmount',     type: 'uint256' },
    { name: 'released',        type: 'uint256' },
    { name: 'startTime',       type: 'uint64' },
    { name: 'cliffDuration',   type: 'uint64' },
    { name: 'vestingDuration', type: 'uint64' },
    { name: 'revocable',       type: 'bool' },
    { name: 'revoked',         type: 'bool' },
  ]}] },
  { name: 'releasableAmount',        type: 'function', stateMutability: 'view',       inputs: [{ name: 'scheduleId', type: 'bytes32' }],                 outputs: [{ type: 'uint256' }] },
  { name: 'release',                 type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'scheduleId', type: 'bytes32' }],                 outputs: [] },
  { name: 'totalVestingAmount',      type: 'function', stateMutability: 'view',       inputs: [],                                                        outputs: [{ type: 'uint256' }] },
] as const;

function ScheduleCard({ id, vestingAddress }: { id: `0x${string}`; vestingAddress: `0x${string}` }) {
  const { data: schedule, refetch: refetchSchedule } = useReadContract({
    address: vestingAddress,
    abi: VESTING_ABI,
    functionName: 'getSchedule',
    args: [id],
  });
  const { data: releasable, refetch: refetchReleasable } = useReadContract({
    address: vestingAddress,
    abi: VESTING_ABI,
    functionName: 'releasableAmount',
    args: [id],
  });

  const { writeContract, isPending } = useWriteContract();

  if (!schedule) return <Skeleton className="h-48" />;

  const now       = Math.floor(Date.now() / 1000);
  const cliffEnd  = Number(schedule.startTime) + Number(schedule.cliffDuration);
  const vestEnd   = Number(schedule.startTime) + Number(schedule.vestingDuration);
  const pctReleased = schedule.totalAmount > BigInt(0)
    ? Number((schedule.released * BigInt(100)) / schedule.totalAmount)
    : 0;

  const statusLabel = schedule.revoked ? 'Revoked'
    : now < cliffEnd  ? 'Cliff Period'
    : now < vestEnd   ? 'Vesting'
    : 'Fully Vested';

  const statusVariant = schedule.revoked ? 'danger'
    : now < cliffEnd  ? 'warning'
    : now < vestEnd   ? 'brand'
    : 'success' as const;

  const canRelease = !schedule.revoked && (releasable ?? 0n) > 0n;

  function handleRelease() {
    writeContract(
      { address: vestingAddress, abi: VESTING_ABI, functionName: 'release', args: [id] },
      {
        onSuccess: () => {
          toast.success('Release transaction submitted!');
          refetchSchedule();
          refetchReleasable();
        },
        onError: e => toast.error(e.message.slice(0, 80)),
      },
    );
  }

  return (
    <Card glow>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-mono text-[var(--text-muted)]">{id.slice(0, 10)}...{id.slice(-6)}</p>
          <Badge variant={statusVariant} dot className="mt-1">{statusLabel}</Badge>
        </div>
        {schedule.revocable && !schedule.revoked && (
          <Badge variant="default">Revocable</Badge>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
          <span>Released</span>
          <span>{pctReleased}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all"
            style={{ width: `${pctReleased}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Total</p>
          <p className="font-bold text-[var(--text-primary)]">{formatTokenAmount(schedule.totalAmount)} MTA</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">Released</p>
          <p className="font-bold text-emerald-400">{formatTokenAmount(schedule.released)} MTA</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">Cliff ends</p>
          <p className="text-[var(--text-secondary)]">{formatDate(cliffEnd)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">Vesting ends</p>
          <p className="text-[var(--text-secondary)]">{formatDate(vestEnd)}</p>
        </div>
      </div>

      {/* Releasable amount + Release button */}
      {!schedule.revoked && (
        <div className="border-t border-[var(--border)] pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)]">Available to release</span>
            <span className={`text-sm font-bold ${canRelease ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
              {releasable !== undefined ? `${formatTokenAmount(releasable)} MTA` : '—'}
            </span>
          </div>
          <Button
            fullWidth onClick={handleRelease} loading={isPending}
            disabled={!canRelease}
            className={canRelease ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'opacity-40'}
          >
            <Download className="w-4 h-4" />
            {now < cliffEnd ? 'Cliff Active — Not Available' : canRelease ? 'Release Tokens' : 'Nothing to Release'}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function VestingPage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const vestingAddress = getContractAddresses(chainId).MTAVesting;

  const { data: scheduleIds, isLoading } = useReadContract({
    address: vestingAddress,
    abi: VESTING_ABI,
    functionName: 'getBeneficiarySchedules',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalVesting } = useReadContract({
    address: vestingAddress,
    abi: VESTING_ABI,
    functionName: 'totalVestingAmount',
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Lock className="w-16 h-16 text-accent-500 mb-6" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">View Your Vesting</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
          Connect your wallet to view your token vesting schedules.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Vesting</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Linear vesting schedules for {formatAddress(address ?? '')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Your Schedules"
          value={String(scheduleIds?.length ?? 0)}
          icon={<Lock className="w-5 h-5" />}
          accentColor="#22d3ee"
          loading={isLoading}
        />
        <StatCard
          label="Protocol Vesting"
          value={totalVesting ? `${formatTokenAmount(totalVesting, 18, 2)} MTA` : '—'}
          icon={<Clock className="w-5 h-5" />}
          accentColor="#a78bfa"
          loading={!totalVesting}
        />
        <StatCard
          label="Status"
          value="Active"
          sub="Vesting contract live"
          icon={<CheckCircle className="w-5 h-5" />}
          accentColor="#34d399"
        />
      </div>

      {/* Schedule cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : !scheduleIds || scheduleIds.length === 0 ? (
        <Card className="text-center py-16">
          <TrendingDown className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">No Vesting Schedules</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Your wallet ({formatAddress(address ?? '')}) has no active vesting schedules.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduleIds.map(id => (
            <ScheduleCard key={id} id={id} vestingAddress={vestingAddress} />
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="mt-8">
        <CardHeader><CardTitle>Vesting Schedule Types</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
            <div className="p-4 rounded-xl bg-[var(--surface-2)]">
              <p className="font-semibold text-[var(--text-primary)] mb-1">Team Allocation (15M MTA)</p>
              <p>12-month cliff → 36-month linear vesting. Revocable. Unvested tokens returned to treasury if revoked.</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface-2)]">
              <p className="font-semibold text-[var(--text-primary)] mb-1">Seed Investors (10M MTA)</p>
              <p>6-month cliff → 18-month linear vesting. Revocable. Earned tokens paid to beneficiary on revocation.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
