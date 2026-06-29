'use client';

import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Vote, Shield, Clock, BarChart3, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useTokenData } from '@/hooks/useTokenData';
import { getContractAddresses } from '@/constants/contracts';

const MTA_ABI = [
  { name: 'delegate', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'delegatee', type: 'address' }], outputs: [] },
  { name: 'delegates', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'address' }] },
] as const;

const GOV_ABI = [
  { name: 'proposalCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'votingDelay',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'votingPeriod',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'quorumNumerator', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;


const MOCK_PROPOSALS = [
  { id: '1', title: 'Update Bronze tier APY from 8% to 10%',       status: 'Active',   votes: { for: 3_200_000, against: 800_000, abstain: 50_000 } },
  { id: '2', title: 'Allocate 500K MTA to ecosystem grants Q3',    status: 'Succeeded', votes: { for: 5_000_000, against: 200_000, abstain: 100_000 } },
  { id: '3', title: 'Upgrade MTAStaking to v2 implementation',     status: 'Pending',  votes: { for: 0, against: 0, abstain: 0 } },
  { id: '4', title: 'Reduce Timelock delay from 48h to 24h',       status: 'Defeated', votes: { for: 1_000_000, against: 4_500_000, abstain: 300_000 } },
] as const;

const statusVariant: Record<string, 'success' | 'brand' | 'warning' | 'danger' | 'default'> = {
  Active: 'brand', Succeeded: 'success', Pending: 'warning', Defeated: 'danger', Executed: 'success',
};

export default function GovernancePage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { userVotes, userBalance, tokenAddress } = useTokenData();
  const addrs = getContractAddresses(chainId);
  const TOKEN_ADDRESS    = tokenAddress;
  const GOVERNOR_ADDRESS = addrs.MTAGovernor;
  const TIMELOCK_ADDRESS = addrs.MTATimelock;

  const { data: delegatee }  = useReadContract({ address: TOKEN_ADDRESS, abi: MTA_ABI, functionName: 'delegates', args: address ? [address] : undefined, query: { enabled: !!address } });
  const { data: govDelay }   = useReadContract({ address: GOVERNOR_ADDRESS, abi: GOV_ABI, functionName: 'votingDelay' });
  const { data: govPeriod }  = useReadContract({ address: GOVERNOR_ADDRESS, abi: GOV_ABI, functionName: 'votingPeriod' });

  const { writeContract, isPending } = useWriteContract();

  const isSelfDelegated = delegatee?.toLowerCase() === address?.toLowerCase();

  function handleDelegate() {
    if (!address) return;
    writeContract({ address: TOKEN_ADDRESS, abi: MTA_ABI, functionName: 'delegate', args: [address] });
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Vote className="w-16 h-16 text-brand-400 mb-6" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">On-Chain Governance</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
          Connect your wallet to participate in MetaAras DAO governance.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Governance</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">MetaAras DAO · On-Chain Voting</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Voting Power"    value={`${userVotes ?? '—'} MTA`}  icon={<Vote className="w-5 h-5" />}     accentColor="#6366f1" />
        <StatCard label="MTA Balance"     value={`${userBalance ?? '—'} MTA`} icon={<Shield className="w-5 h-5" />}  accentColor="#a78bfa" />
        <StatCard label="Voting Delay"    value={govDelay ? `${Number(govDelay).toLocaleString()} blocks` : '7,200 blocks'} icon={<Clock className="w-5 h-5" />} accentColor="#22d3ee" />
        <StatCard label="Voting Period"   value={govPeriod ? `${Number(govPeriod).toLocaleString()} blocks` : '50,400 blocks'} icon={<BarChart3 className="w-5 h-5" />} accentColor="#34d399" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">Proposals</h2>
            <Badge variant="default">{MOCK_PROPOSALS.length} total</Badge>
          </div>
          {MOCK_PROPOSALS.map(p => {
            const totalVotes = p.votes.for + p.votes.against + p.votes.abstain;
            const forPct = totalVotes > 0 ? (p.votes.for / totalVotes) * 100 : 0;
            return (
              <Card key={p.id} glow>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Proposal #{p.id}</p>
                    <h3 className="font-medium text-[var(--text-primary)]">{p.title}</h3>
                  </div>
                  <Badge variant={statusVariant[p.status] ?? 'default'} dot className="flex-shrink-0">
                    {p.status}
                  </Badge>
                </div>

                {totalVotes > 0 && (
                  <div className="mb-4">
                    <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        style={{ width: `${forPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                      <span className="text-emerald-400">For: {(p.votes.for / 1e6).toFixed(1)}M</span>
                      <span className="text-red-400">Against: {(p.votes.against / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                )}

                {p.status === 'Active' && (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400" disabled>
                      Vote For
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 border-red-500/30 hover:bg-red-500/10 text-red-400" disabled>
                      Vote Against
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Delegation card */}
          <Card>
            <CardHeader><CardTitle>Voting Power</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-2)]">
                <p className="text-xs text-[var(--text-muted)]">Current power</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{userVotes ?? '0'}</p>
                <p className="text-xs text-[var(--text-muted)]">MTA</p>
              </div>
              {!isSelfDelegated ? (
                <>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Delegate your MTA to activate voting power. You keep full ownership of your tokens.
                  </p>
                  <Button fullWidth onClick={handleDelegate} loading={isPending}>
                    <Vote className="w-4 h-4" /> Self-Delegate
                  </Button>
                </>
              ) : (
                <Badge variant="success" dot className="w-full justify-center py-2">
                  Voting active
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Protocol params */}
          <Card>
            <CardHeader><CardTitle>Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'Proposal threshold', value: '500K MTA' },
                  { label: 'Quorum',             value: '4% (4M MTA)' },
                  { label: 'Voting delay',        value: '~24h (7200 blocks)' },
                  { label: 'Voting period',       value: '~7 days (50400 blocks)' },
                  { label: 'Timelock delay',      value: '48 hours' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <span className="font-medium text-[var(--text-primary)]">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contracts */}
          <Card>
            <CardHeader><CardTitle>Contracts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Governor',  addr: GOVERNOR_ADDRESS },
                  { label: 'Timelock',  addr: TIMELOCK_ADDRESS },
                  { label: 'MTA Token', addr: TOKEN_ADDRESS },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{c.label}</span>
                    <span className="font-mono text-brand-400">{c.addr.slice(0, 8)}…</span>
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
