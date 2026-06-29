export function formatNumber(value: number | bigint, decimals = 2): string {
  const n = typeof value === 'bigint' ? Number(value) : value;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(decimals)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(decimals)}K`;
  return n.toFixed(decimals);
}

export function formatTokenAmount(wei: bigint, tokenDecimals = 18, displayDecimals = 2): string {
  const divisor = BigInt(10) ** BigInt(tokenDecimals);
  const whole   = wei / divisor;
  const frac    = wei % divisor;
  const fracStr = frac.toString().padStart(tokenDecimals, '0').slice(0, displayDecimals);
  return formatNumber(Number(`${whole}.${fracStr}`), displayDecimals);
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(days: number): string {
  if (days >= 365) return `${Math.round(days / 365)}y`;
  if (days >= 30)  return `${Math.round(days / 30)}m`;
  return `${days}d`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
