'use client';

import { useAccount, useChainId } from 'wagmi';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Coins, Zap, Lock, Vote, ArrowRight, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTokenData, useStakingData } from '@/hooks/useTokenData';
import { formatAddress } from '@/utils/format';
import { getContractAddresses } from '@/constants/contracts';

const QUICK_ACTIONS = [
  { label: 'Stake MTA',      href: '/staking',    icon: Zap,   color: '#6366f1', desc: 'Earn up to 40% APY' },
  { label: 'Vesting',        href: '/vesting',    icon: Lock,  color: '#22d3ee', desc: 'View your schedule' },
  { label: 'Governance',     href: '/governance', icon: Vote,  color: '#a78bfa', desc: 'Vote on proposals' },
] as const;

function WalletNotConnected() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10 text-brand-400" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Connect Your Wallet</h2>
      <p className="text-[var(--text-secondary)] max-w-sm mb-8">
        Connect your Ethereum wallet to view your token holdings, staking positions, and governance power.
      </p>
      <ConnectButton />
    </div>
  );
}

export default function DashboardPage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { userBalance, userVotes, totalSupply, circulatingSupply, paused } = useTokenData();
  const { globalTotalStaked, positionCount, stakingAddress } = useStakingData();
  const contractAddrs = getContractAddresses(chainId);

  if (!isConnected) return <WalletNotConnected />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {formatAddress(address ?? '')} · MetaAras Protocol
          </p>
        </div>
        <div className="flex items-center gap-2">
          {paused && <Badge variant="danger" dot>Protocol Paused</Badge>}
          <Badge variant="success" dot>Mainnet Ready</Badge>
        </div>
      </div>

      {/* User stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="MTA Balance"
          value={`${userBalance ?? '—'} MTA`}
          icon={<Coins className="w-5 h-5" />}
          accentColor="#6366f1"
          loading={userBalance === undefined}
        />
        <StatCard
          label="Voting Power"
          value={`${userVotes ?? '—'} MTA`}
          sub="Self-delegate to activate"
          icon={<Vote className="w-5 h-5" />}
          accentColor="#a78bfa"
          loading={userVotes === undefined}
        />
        <StatCard
          label="Staking Positions"
          value={String(positionCount)}
          sub="Active positions"
          icon={<Zap className="w-5 h-5" />}
          accentColor="#22d3ee"
        />
        <StatCard
          label="Global TVL"
          value={globalTotalStaked ? `${globalTotalStaked} MTA` : '—'}
          sub="Total value locked"
          icon={<Lock className="w-5 h-5" />}
          accentColor="#34d399"
          loading={globalTotalStaked === undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol stats */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Overview</CardTitle>
              <Badge variant="brand">Live Data</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Supply',       value: totalSupply        ? `${totalSupply} MTA`       : '—' },
                  { label: 'Circulating Supply', value: circulatingSupply  ? `${circulatingSupply} MTA` : '—' },
                  { label: 'Total Staked',       value: globalTotalStaked  ? `${globalTotalStaked} MTA` : '—' },
                  { label: 'Max Supply',         value: '100M MTA' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-xl bg-[var(--surface-2)]">
                    <p className="text-xs text-[var(--text-muted)]">{label}</p>
                    <p className="mt-1 font-bold text-[var(--text-primary)]">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Network info */}
          <Card>
            <CardHeader><CardTitle>Contract Addresses</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'MTA Token',  addr: contractAddrs.MTAToken },
                  { label: 'Staking',    addr: stakingAddress },
                  { label: 'Vesting',    addr: contractAddrs.MTAVesting },
                  { label: 'Governor',   addr: contractAddrs.MTAGovernor },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-[var(--text-muted)] flex-shrink-0">{c.label}</span>
                    <span className="font-mono text-xs text-brand-400 truncate">{c.addr}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {QUICK_ACTIONS.map(action => (
                  <Link key={action.href} href={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors group cursor-pointer">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${action.color}20` }}
                      >
                        <action.icon className="w-4 h-4" style={{ color: action.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{action.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{action.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-brand-400 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Governance power tip */}
          {userVotes === '0' && userBalance !== '0' && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Activate Voting Power</p>
                  <p className="text-xs text-amber-400/80 mt-1">
                    Delegate your MTA to yourself to participate in governance.
                  </p>
                  <Link href="/governance">
                    <Button variant="outline" size="xs" className="mt-3 border-amber-500/40 text-amber-400">
                      Go to Governance
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
