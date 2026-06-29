export const MAX_SUPPLY = 100_000_000;

export const ALLOCATIONS = [
  { label: 'Ecosystem',  pct: 35, amount: 35_000_000, color: '#6366f1', vesting: 'Unlocked at TGE (dao-governed)' },
  { label: 'Liquidity',  pct: 20, amount: 20_000_000, color: '#22d3ee', vesting: 'Unlocked at TGE' },
  { label: 'Team',       pct: 15, amount: 15_000_000, color: '#a78bfa', vesting: '12m cliff → 36m linear' },
  { label: 'Treasury',   pct: 15, amount: 15_000_000, color: '#34d399', vesting: 'Timelock-controlled' },
  { label: 'Seed',       pct: 10, amount: 10_000_000, color: '#fb923c', vesting: '6m cliff → 18m linear' },
  { label: 'Public',     pct:  5, amount:  5_000_000, color: '#f472b6', vesting: 'Unlocked at TGE' },
] as const;

export const STAKING_TIERS = [
  { name: 'Bronze',   lockDays: 30,  apy: 8,  color: '#b45309' },
  { name: 'Silver',   lockDays: 90,  apy: 15, color: '#94a3b8' },
  { name: 'Gold',     lockDays: 180, apy: 25, color: '#ca8a04' },
  { name: 'Platinum', lockDays: 365, apy: 40, color: '#7c3aed' },
] as const;

export const TOKEN_SYMBOL = 'MTA';
export const TOKEN_NAME   = 'MetaAras';
export const TOKEN_DECIMALS = 18;
