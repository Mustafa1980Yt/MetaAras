import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MetaAras — Multichain DeFi Protocol';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: 'linear-gradient(135deg, #080812 0%, #0e0e23 50%, #080812 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            marginBottom: 24,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <path d="M18 4L8 18h8l-2 10 12-14h-8L18 4z" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-2px',
            marginBottom: 16,
          }}
        >
          Meta<span style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)', backgroundClip: 'text', color: 'transparent' }}>Aras</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            marginBottom: 40,
          }}
        >
          Multichain DeFi Protocol
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Max Supply', value: '100M MTA' },
            { label: 'Max APY', value: '40%' },
            { label: 'Chains', value: 'ETH + BSC' },
            { label: 'Unit Tests', value: '97/97' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '12px 24px',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{stat.value}</span>
              <span style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 18,
            color: '#475569',
          }}
        >
          metaaras.io
        </div>
      </div>
    ),
    { ...size }
  );
}
