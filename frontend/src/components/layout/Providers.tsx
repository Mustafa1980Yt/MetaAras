'use client';

import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { useState, type ReactNode } from 'react';
import { wagmiConfig } from '@/lib/wagmi/config';

import '@rainbow-me/rainbowkit/styles.css';

function RainbowKitThemeAdapter({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const rkTheme = isDark
    ? darkTheme({
        accentColor: '#6366f1',
        accentColorForeground: '#ffffff',
        borderRadius: 'medium',
        fontStack: 'system',
      })
    : lightTheme({
        accentColor: '#6366f1',
        accentColorForeground: '#ffffff',
        borderRadius: 'medium',
        fontStack: 'system',
      });

  return <RainbowKitProvider theme={rkTheme}>{children}</RainbowKitProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemeAdapter>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
              }}
            />
          </RainbowKitThemeAdapter>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
