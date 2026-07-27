import { useReducedMotion } from 'framer-motion';

// Shared scroll-reveal + page-transition presets so every page animates
// with the same easing/duration/offset instead of hand-tuned one-offs.
// All variants collapse to a plain, near-instant fade when the user has
// requested reduced motion.
export function useMotionPresets() {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: prefersReducedMotion ? 0.01 : 0.6, ease: 'easeOut' },
  };

  // Smaller offset/duration for grid items and inline content, matching the
  // "subtle" scroll-reveal tier (300-400ms, 8-16px) rather than the hero tier.
  const fadeUpSm = (delay = 0) => ({
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: prefersReducedMotion ? 0.01 : 0.35, ease: 'easeOut', delay: prefersReducedMotion ? 0 : delay },
  });

  const pageVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  const pageTransition = { duration: prefersReducedMotion ? 0.01 : 0.25, ease: 'easeOut' };

  return { prefersReducedMotion, fadeUp, fadeUpSm, pageVariants, pageTransition };
}
