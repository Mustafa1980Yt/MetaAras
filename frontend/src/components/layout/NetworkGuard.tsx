'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { AlertTriangle } from 'lucide-react';
import { getActiveChains, isActiveChain, getNetworkConfig, NETWORK_ENV } from '@/config/networks';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const onSupportedChain = isActiveChain(chainId);

  if (onSupportedChain) return <>{children}</>;

  const activeChains = getActiveChains();
  const currentNetwork = getNetworkConfig(chainId);
  const networkLabel = currentNetwork?.label ?? `Chain ${chainId}`;
  const envLabel = NETWORK_ENV === 'mainnet' ? 'Mainnet' : 'Testnet';

  return (
    <>
      <div className="sticky top-16 z-40 w-full bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">
                Desteklenmeyen ağ: {networkLabel}
              </span>
            </div>
            <p className="text-sm text-amber-400/80 flex-1">
              MetaAras {envLabel}&apos;ta yalnızca şu ağları destekler:
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {activeChains.map((cfg) => (
                <button
                  key={cfg.chain.id}
                  onClick={() => switchChain({ chainId: cfg.chain.id })}
                  disabled={isPending}
                  className="
                    px-3 py-1.5 text-xs font-semibold rounded-lg
                    bg-amber-500/20 text-amber-300 border border-amber-500/40
                    hover:bg-amber-500/30 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isPending ? '…' : cfg.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
