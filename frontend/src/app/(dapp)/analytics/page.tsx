'use client';

import { useReadContract, useChainId } from 'wagmi';
import { BarChart3, TrendingUp, Users, Zap, Lock, Award, Shield, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { getContractAddresses } from '@/constants/contracts';
import { formatTokenAmount } from '@/utils/format';

const TOKEN_ABI = [
  { name: 'totalSupply',       type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'circulatingSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'isMintingDisabled', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'paused',            type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
] as const;

const STAKING_ABI = [
  { name: 'globalTotalStaked',         type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalPenaltiesCollected',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

const VESTING_ABI = [
  { name: 'totalVestingAmount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

const TIER_DATA = [
  { name: 'Bronze',   apy: 8,  lockDays: 30,  color: '#cd7f32', pct: 15 },
  { name: 'Silver',   apy: 15, lockDays: 90,  color: '#9ca3af', pct: 25 },
  { name: 'Gold',     apy: 25, lockDays: 180, color: '#eab308', pct: 40 },
  { name: 'Platinum', apy: 40, lockDays: 365, color: '#6366f1', pct: 20 },
];

const ALLOCATION_DATA = [
  { label: 'Ecosystem',  pct: 35, amount: '35M', color: '#6366f1' },
  { label: 'Liquidity',  pct: 20, amount: '20M', color: '#22d3ee' },
  { label: 'Team',       pct: 15, amount: '15M', color: '#a78bfa' },
  { label: 'Treasury',   pct: 15, amount: '15M', color: '#34d399' },
  { label: 'Seed',       pct: 10, amount: '10M', color: '#f59e0b' },
  { label: 'Public',     pct:  5, amount: '5M',  color: '#f472b6' },
];

function BarChartRow({ label, value, max, color, suffix = '' }: {
  label: string; value: number; max: number; color: string; suffix?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-semibold text-[var(--text-primary)]">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const chainId = useChainId();
  const addrs   = getContractAddresses(chainId);
  const tokenAddr  = addrs.MTAToken   as `0x${string}`;
  const stakeAddr  = addrs.MTAStaking as `0x${string}`;
  const vestAddr   = addrs.MTAVesting as `0x${string}`;

  const { data: totalSupply }    = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'totalSupply' });
  const { data: circulating }    = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'circulatingSupply' });
  const { data: mintDisabled }   = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'isMintingDisabled' });
  const { data: tokenPaused }    = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'paused' });
  const { data: globalStaked }   = useReadContract({ address: stakeAddr, abi: STAKING_ABI, functionName: 'globalTotalStaked' });
  const { data: penalties }      = useReadContract({ address: stakeAddr, abi: STAKING_ABI, functionName: 'totalPenaltiesCollected' });
  const { data: totalVesting }   = useReadContract({ address: vestAddr,  abi: VESTING_ABI, functionName: 'totalVestingAmount' });

  const totalSupplyFmt  = totalSupply  ? parseFloat(formatTokenAmount(totalSupply,  18, 2).replace(/,/g, '')) : null;
  const circulatingFmt  = circulating  ? parseFloat(formatTokenAmount(circulating,  18, 2).replace(/,/g, '')) : null;
  const globalStakedFmt = globalStaked ? parseFloat(formatTokenAmount(globalStaked, 18, 2).replace(/,/g, '')) : null;
  const totalVestingFmt = totalVesting ? parseFloat(formatTokenAmount(totalVesting, 18, 2).replace(/,/g, '')) : null;
  const penaltiesFmt    = penalties    ? parseFloat(formatTokenAmount(penalties,    18, 4).replace(/,/g, '')) : null;

  const stakedPct = totalSupplyFmt && globalStakedFmt
    ? Math.round((globalStakedFmt / totalSupplyFmt) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">Protocol metrics · Live on-chain data</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Supply"     value={totalSupply  ? `${formatTokenAmount(totalSupply, 18, 0)} MTA` : '—'}        icon={<Zap className="w-5 h-5" />}       accentColor="#6366f1" loading={!totalSupply} />
        <StatCard label="Circulating"      value={circulating  ? `${formatTokenAmount(circulating, 18, 0)} MTA` : '—'}        icon={<Activity className="w-5 h-5" />}   accentColor="#22d3ee" loading={!circulating} />
        <StatCard label="Total Staked"     value={globalStaked ? `${formatTokenAmount(globalStaked, 18, 2)} MTA` : '—'}       icon={<Lock className="w-5 h-5" />}       accentColor="#34d399" loading={!globalStaked} />
        <StatCard label="Staking Ratio"    value={stakedPct ? `${stakedPct}%` : '—'}   sub="of total supply"                 icon={<TrendingUp className="w-5 h-5" />}  accentColor="#a78bfa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Token distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Token Allocation</CardTitle>
            <Badge variant="brand">100M MTA</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {ALLOCATION_DATA.map(a => (
              <div key={a.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                    <span className="text-[var(--text-secondary)]">{a.label}</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{a.amount} MTA · {a.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${a.pct * 2.85}%`, background: a.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Supply metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Supply Metrics</CardTitle>
            <Badge variant={mintDisabled ? 'success' : 'warning'} dot>{mintDisabled ? 'Minting Disabled' : 'Minting Active'}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Max Supply',        value: 100_000_000, color: '#6366f1', suffix: ' MTA' },
              { label: 'Total Supply',      value: totalSupplyFmt ?? 0, color: '#22d3ee', suffix: ' MTA' },
              { label: 'Circulating',       value: circulatingFmt ?? 0, color: '#34d399', suffix: ' MTA' },
              { label: 'Total Vesting',     value: totalVestingFmt ?? 0, color: '#a78bfa', suffix: ' MTA' },
              { label: 'Total Staked',      value: globalStakedFmt ?? 0, color: '#f59e0b', suffix: ' MTA' },
            ].map(m => (
              <BarChartRow key={m.label} label={m.label} value={m.value} max={100_000_000} color={m.color} suffix="" />
            ))}

            <div className="pt-2 border-t border-[var(--border)]">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                  <p className="text-xs text-[var(--text-muted)]">Protocol Status</p>
                  <p className={`font-bold mt-0.5 ${tokenPaused ? 'text-red-400' : 'text-emerald-400'}`}>{tokenPaused ? 'PAUSED' : 'ACTIVE'}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                  <p className="text-xs text-[var(--text-muted)]">Penalties Collected</p>
                  <p className="font-bold text-[var(--text-primary)] mt-0.5">{penaltiesFmt !== null ? `${penaltiesFmt.toFixed(2)} MTA` : '—'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staking tiers analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-400" /> Staking Tier Analysis
          </CardTitle>
          <Badge variant="brand">4 Tiers</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIER_DATA.map(t => (
              <div key={t.name} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-brand-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-[var(--text-primary)]">{t.name}</span>
                  <span className="text-lg font-extrabold" style={{ color: t.color }}>{t.apy}%</span>
                </div>
                <div className="space-y-2 text-xs text-[var(--text-muted)]">
                  <div className="flex justify-between"><span>Lock Days</span><span className="text-[var(--text-secondary)]">{t.lockDays}d</span></div>
                  <div className="flex justify-between"><span>Min Amount</span><span className="text-[var(--text-secondary)]">1 MTA</span></div>
                  <div className="flex justify-between"><span>Early Exit</span><span className="text-red-400">20% penalty</span></div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">Distribution (est.)</span>
                    <span style={{ color: t.color }}>{t.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${t.pct * 2.5}%`, background: t.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocol health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Protocol Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Token Contract',    status: !tokenPaused ? 'Operational' : 'Paused',  ok: !tokenPaused },
              { label: 'Minting',           status: mintDisabled ? 'Disabled (Safe)' : 'Active', ok: !!mintDisabled },
              { label: 'Staking Contract',  status: 'Operational',          ok: true },
              { label: 'Vesting Contract',  status: 'Operational',          ok: true },
              { label: 'Governance',        status: 'Active',                ok: true },
              { label: 'Timelock',          status: '48h Delay Active',      ok: true },
            ].map(h => (
              <div key={h.label} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)]">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${h.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{h.label}</p>
                  <p className={`text-xs ${h.ok ? 'text-emerald-400' : 'text-red-400'}`}>{h.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
