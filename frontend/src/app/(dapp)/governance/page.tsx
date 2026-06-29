'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Vote, Shield, Clock, BarChart3, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useTokenData } from '@/hooks/useTokenData';
import { getContractAddresses } from '@/constants/contracts';
import toast from 'react-hot-toast';

const MTA_ABI = [
  { name: 'delegate', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'delegatee', type: 'address' }], outputs: [] },
  { name: 'delegates', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'address' }] },
] as const;

const GOV_ABI = [
  { name: 'votingDelay',     type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'votingPeriod',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'quorumNumerator', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  {
    name: 'castVote', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'support', type: 'uint8' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'hasVoted', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'account', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'proposalVotes', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [{ name: 'againstVotes', type: 'uint256' }, { name: 'forVotes', type: 'uint256' }, { name: 'abstainVotes', type: 'uint256' }],
  },
  {
    name: 'state', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [{ type: 'uint8' }],
  },
] as const;

// ProposalState enum from OpenZeppelin Governor
const PROPOSAL_STATES = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'] as const;

const statusVariant: Record<string, 'success' | 'brand' | 'warning' | 'danger' | 'default'> = {
  Active: 'brand', Succeeded: 'success', Pending: 'warning', Defeated: 'danger',
  Executed: 'success', Queued: 'warning', Canceled: 'danger', Expired: 'danger',
};

// Real on-chain proposals — add proposal IDs as they're created on-chain
// Format: { id: bigint (on-chain proposalId), title: string, descriptionHash: string }
const KNOWN_PROPOSALS: { id: bigint; title: string }[] = [
  // Add real proposal IDs here once governance is live on mainnet
  // Example: { id: 12345678901234567890n, title: 'Proposal: Update Bronze tier APY' }
];

function ProposalCard({
  proposalId, title, governorAddress, userAddress, onVote,
}: { proposalId: bigint; title: string; governorAddress: `0x${string}`; userAddress?: `0x${string}`; onVote: (id: bigint, support: number) => void }) {
  const { data: stateRaw } = useReadContract({ address: governorAddress, abi: GOV_ABI, functionName: 'state', args: [proposalId] });
  const { data: votes }    = useReadContract({ address: governorAddress, abi: GOV_ABI, functionName: 'proposalVotes', args: [proposalId] });
  const { data: hasVoted } = useReadContract({ address: governorAddress, abi: GOV_ABI, functionName: 'hasVoted', args: userAddress ? [proposalId, userAddress] : undefined, query: { enabled: !!userAddress } });

  const stateNum   = stateRaw !== undefined ? Number(stateRaw) : undefined;
  const stateName  = stateNum !== undefined ? (PROPOSAL_STATES[stateNum] ?? 'Unknown') : 'Loading...';
  const isActive   = stateName === 'Active';

  const forVotes     = votes ? Number(votes[1]) / 1e18 : 0;
  const againstVotes = votes ? Number(votes[0]) / 1e18 : 0;
  const abstainVotes = votes ? Number(votes[2]) / 1e18 : 0;
  const totalVotes   = forVotes + againstVotes + abstainVotes;
  const forPct       = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;

  return (
    <Card glow>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1 font-mono">{proposalId.toString().slice(0, 12)}…</p>
          <h3 className="font-medium text-[var(--text-primary)]">{title}</h3>
        </div>
        <Badge variant={statusVariant[stateName] ?? 'default'} dot className="flex-shrink-0">
          {stateName}
        </Badge>
      </div>

      {totalVotes > 0 && (
        <div className="mb-4">
          <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${forPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
            <span className="text-emerald-400">For: {forVotes.toFixed(0)}M</span>
            <span className="text-amber-400">Abstain: {abstainVotes.toFixed(0)}</span>
            <span className="text-red-400">Against: {againstVotes.toFixed(0)}M</span>
          </div>
        </div>
      )}

      {hasVoted && (
        <Badge variant="success" dot className="mb-3">Already voted</Badge>
      )}

      {isActive && !hasVoted && (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onVote(proposalId, 1)} className="flex-1 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" /> For
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onVote(proposalId, 2)} className="flex-1 border-amber-500/30 hover:bg-amber-500/10 text-amber-400">
            <MinusCircle className="w-3.5 h-3.5" /> Abstain
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onVote(proposalId, 0)} className="flex-1 border-red-500/30 hover:bg-red-500/10 text-red-400">
            <XCircle className="w-3.5 h-3.5" /> Against
          </Button>
        </div>
      )}
    </Card>
  );
}

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
  const [manualProposalId, setManualProposalId] = useState('');

  const isSelfDelegated = delegatee?.toLowerCase() === address?.toLowerCase();

  function handleDelegate() {
    if (!address) return;
    writeContract(
      { address: TOKEN_ADDRESS, abi: MTA_ABI, functionName: 'delegate', args: [address] },
      { onSuccess: () => toast.success('Self-delegation submitted!'), onError: e => toast.error(e.message.slice(0, 60)) },
    );
  }

  function handleVote(proposalId: bigint, support: number) {
    const supportLabel = support === 1 ? 'For' : support === 0 ? 'Against' : 'Abstain';
    writeContract(
      { address: GOVERNOR_ADDRESS, abi: GOV_ABI, functionName: 'castVote', args: [proposalId, support] },
      {
        onSuccess: () => toast.success(`Vote cast: ${supportLabel}`),
        onError: e => toast.error(e.message.slice(0, 80)),
      },
    );
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

  const allProposals = [...KNOWN_PROPOSALS];
  if (manualProposalId && /^\d+$/.test(manualProposalId)) {
    const exists = allProposals.some(p => p.id === BigInt(manualProposalId));
    if (!exists) allProposals.push({ id: BigInt(manualProposalId), title: `Proposal #${manualProposalId}` });
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
        <StatCard label="Voting Delay"    value={govDelay ? `${(Number(govDelay) / 3600).toFixed(0)}h` : '24h'} icon={<Clock className="w-5 h-5" />} accentColor="#22d3ee" />
        <StatCard label="Voting Period"   value={govPeriod ? `${(Number(govPeriod) / 86400).toFixed(0)} days` : '7 days'} icon={<BarChart3 className="w-5 h-5" />} accentColor="#34d399" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">Proposals</h2>
            <Badge variant="default">{allProposals.length} total</Badge>
          </div>

          {/* Manual proposal lookup */}
          <Card>
            <CardContent>
              <p className="text-xs text-[var(--text-muted)] mb-2">Enter a proposal ID to load it</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualProposalId}
                  onChange={e => setManualProposalId(e.target.value.replace(/\D/g, ''))}
                  placeholder="Proposal ID (numeric)"
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </CardContent>
          </Card>

          {allProposals.length === 0 ? (
            <Card className="text-center py-12">
              <Vote className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">No proposals yet</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Proposals will appear here once governance is live on-chain.<br />
                You need 500K MTA to create a proposal.
              </p>
            </Card>
          ) : (
            allProposals.map(p => (
              <ProposalCard
                key={p.id.toString()}
                proposalId={p.id}
                title={p.title}
                governorAddress={GOVERNOR_ADDRESS}
                userAddress={address}
                onVote={handleVote}
              />
            ))
          )}
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
                  { label: 'Voting delay',        value: '24 hours (86,400 s)' },
                  { label: 'Voting period',       value: '7 days (604,800 s)' },
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
