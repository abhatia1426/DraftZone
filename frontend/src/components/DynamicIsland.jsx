import { motion } from 'framer-motion';
import LiquidGlassCard from './LiquidGlassCard';
import { useMotionPresets } from '../lib/motion';

const MotionDiv = motion.div;

// Fixed capsule near the top of the viewport that collapses to a quiet
// status pill and expands into a liquid-glass panel with contextual
// content — an Apple Dynamic Island-style affordance driven by whatever
// `expanded` state the host page passes in (scroll position, active
// filters, etc).
export default function DynamicIsland({ expanded, collapsed, children, className = 'top-4 left-1/2 -translate-x-1/2' }) {
  const { prefersReducedMotion } = useMotionPresets();

  return (
    <MotionDiv
      layout={!prefersReducedMotion}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed z-40 ${className}`}
      style={{ borderRadius: 999 }}
    >
      {expanded ? (
        <LiquidGlassCard borderRadius={999} tint="rgba(var(--bg-surface-rgb), 0.75)" style={{ boxShadow: '0 12px 32px rgba(var(--text-primary-rgb), 0.18)' }}>
          {children}
        </LiquidGlassCard>
      ) : (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(var(--text-primary-rgb), 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 24px rgba(var(--text-primary-rgb), 0.2)',
          }}
        >
          {collapsed}
        </div>
      )}
    </MotionDiv>
  );
}
