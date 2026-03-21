import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Wisery — Ask. Vote. Earn. — The Crowd Knows.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a14, #1a1a2e, #0a0a14)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
        }}
      >
        {/* Gradient orbs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.2), transparent)', display: 'flex' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: 900, color: 'white',
          }}>
            W
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '48px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>
              Wisery
            </span>
          </div>
        </div>

        {/* Slogan */}
        <div style={{
          fontSize: '32px', fontWeight: 700, color: '#e8e8f0',
          marginBottom: '16px', display: 'flex',
        }}>
          Ask. Vote. Earn. — The Crowd Knows.
        </div>

        {/* Description */}
        <div style={{
          fontSize: '20px', color: '#6b7094', textAlign: 'center',
          maxWidth: '700px', lineHeight: 1.5, display: 'flex',
        }}>
          Social prediction platform with crypto rewards. Vote on outcomes, earn WSR tokens.
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: '40px', marginTop: '40px',
          padding: '16px 32px', borderRadius: '16px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>Live</span>
            <span style={{ fontSize: '14px', color: '#6b7094' }}>Markets</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>AI</span>
            <span style={{ fontSize: '14px', color: '#6b7094' }}>Analysis</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#6366f1' }}>WSR</span>
            <span style={{ fontSize: '14px', color: '#6b7094' }}>Token</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#ec4899' }}>Free</span>
            <span style={{ fontSize: '14px', color: '#6b7094' }}>To Join</span>
          </div>
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute', bottom: '24px',
          fontSize: '16px', color: '#6b7094', display: 'flex',
        }}>
          wisery.live
        </div>
      </div>
    ),
    { ...size }
  );
}
