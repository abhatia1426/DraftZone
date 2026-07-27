import { useId } from 'react';

// Real Apple-style "liquid glass" refraction, ported from KokonutUI's
// liquid-glass-card (https://kokonutui.com/docs/cards/liquid-glass-card) —
// rebuilt without its shadcn/Tailwind-v4 dependencies so it runs on this
// project's Tailwind v3 setup. Uses an SVG feTurbulence + feDisplacementMap
// filter as backdrop-filter for genuine light refraction, not just blur.

const GlassFilter = ({ id, scale = 30 }) => (
  <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter colorInterpolationFilters="sRGB" height="200%" id={id} width="200%" x="-50%" y="-50%">
        <feTurbulence baseFrequency="0.05 0.05" numOctaves="1" result="turbulence" seed="1" type="fractalNoise" />
        <feGaussianBlur in="turbulence" result="blurredNoise" stdDeviation="2" />
        <feDisplacementMap in="SourceGraphic" in2="blurredNoise" result="displaced" scale={scale} xChannelSelector="R" yChannelSelector="B" />
        <feGaussianBlur in="displaced" result="finalBlur" stdDeviation="4" />
        <feComposite in="finalBlur" in2="finalBlur" operator="over" />
      </filter>
    </defs>
  </svg>
);

export default function LiquidGlassCard({ children, style, borderRadius = 20, filterScale = 30, tint = 'rgba(255,255,255,0.25)' }) {
  const filterId = useId();

  return (
    <div style={{ position: 'relative', borderRadius, overflow: 'hidden', ...style }}>
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: -1, isolation: 'isolate', overflow: 'hidden', borderRadius: 'inherit',
          backdropFilter: `url("#${filterId}") blur(1px)`,
          WebkitBackdropFilter: `blur(14px)`,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: tint, borderRadius: 'inherit' }} />
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -1px 1px rgba(255,255,255,0.3), 0 8px 32px rgba(30,25,15,0.12)',
          border: '1px solid rgba(255,255,255,0.4)',
        }}
      />
      <GlassFilter id={filterId} scale={filterScale} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
