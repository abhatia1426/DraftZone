import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
// `motion` is used throughout via JSX tags like <motion.div>, which this
// project's no-unused-vars config (no eslint-plugin-react) doesn't track.
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import axios from 'axios';
import { ArrowRight, ArrowDown, Menu, X } from 'lucide-react';
import Logo from './components/Logo';
import { useMotionPresets } from './lib/motion';

// This page intentionally does not use the app-wide --bg-base/--text-primary
// theme variables or the shared AppNav/DynamicIsland/LiquidGlassCard
// components. The rest of the app keeps its light/dark toggle and glass
// styling untouched; the homepage commits to its own fixed near-black
// editorial palette, independent of that toggle, matching hut8.com's
// restrained hero treatment.
const INK = '#08090A';
const PAPER = '#F5F5F7';
const ACCENT = '#4FCE7C';
const HAIRLINE = 'rgba(245,245,247,0.08)';

const FOCUS_RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4FCE7C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090A]';

const NAV_LINKS = [
  { label: 'Players', to: '/player-search' },
  { label: 'Draft', to: '/draft' },
  { label: 'Odds', to: '/odds' },
  { label: 'Bets', to: '/my-bets' },
  { label: 'Authors', to: '/authors' },
];

const STEPS = [
  {
    title: 'Create your account',
    description: 'Sign up and choose your mode — head-to-head PvP or against the AI.',
  },
  {
    title: 'Draft with AI insights',
    description: "Your AI Scout recommends picks in real time, tailored to your roster's needs.",
  },
  {
    title: 'Track odds & bets',
    description: 'Follow live game odds and manage your bet history, all in one place.',
  },
];

const CAPABILITIES = [
  {
    title: 'Real-time rankings',
    description: 'Live player rankings updated every minute with expert projections and injury reports.',
    to: '/player-search',
    cta: 'Search players',
  },
  {
    title: 'AI draft assistant',
    description: 'Personalized pick recommendations based on your league settings and draft position.',
    to: '/draft',
    cta: 'Start a draft',
  },
  {
    title: 'Live odds & betting',
    description: 'Real-time spreads, moneylines, and totals — place bets and track your balance.',
    to: '/odds',
    cta: 'View odds',
  },
];

// Counts up from 0 to the numeric portion of `value` once it scrolls into
// view; non-numeric values (e.g. "24/7") pass through unchanged. Skips the
// animation entirely under prefers-reduced-motion.
function AnimatedNumber({ value, reduceMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  // null = not animating (yet); render the static `value` until the count-up
  // effect below starts producing frames, so there's no synchronous setState
  // in the effect body itself — only inside the async rAF callback.
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const match = value.match(/[\d,]+/);
    if (!match) return;
    const target = parseInt(match[0].replace(/,/g, ''), 10);
    const prefix = value.slice(0, match.index);
    const suffix = value.slice(match.index + match[0].length);
    const duration = 1100;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(`${prefix}${Math.round(target * eased).toLocaleString()}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduceMotion]);

  return <span ref={ref}>{display ?? value}</span>;
}

// Scroll-linked opacity/parallax for the hero's background motif: fades from
// `maxOpacity` to 0 as the hero scrolls past (progress 0 → 1 over the hero's
// own height), rather than fading in/out like the sections below it since
// it's already visible on load.
function useHeroMotif(ref, reduceMotion, maxOpacity = 0.1) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 1], [maxOpacity, 0]);
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 70]);
  return { opacity, y };
}

// Scroll-linked opacity/parallax for a section's background motif: fades in
// as the section enters the viewport, holds, then fades out as it leaves —
// this is what gives each section a different silhouette "handoff" rather
// than a single static background image behind every section.
function useSectionMotif(ref, reduceMotion, maxOpacity = 0.1) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, maxOpacity, maxOpacity, 0]);
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [50, -50]);
  return { opacity, y };
}

// Concentric ellipses read as an abstract stadium bowl seen at an angle —
// used to bookend the hero and closing CTA rather than a literal stadium
// photo (avoids both copyright risk and clashing with the flat palette).
function StadiumRings({ className }) {
  return (
    <svg viewBox="0 0 600 600" fill="none" className={className} aria-hidden="true">
      <ellipse cx="300" cy="300" rx="290" ry="150" stroke={PAPER} strokeWidth="1" />
      <ellipse cx="300" cy="300" rx="225" ry="110" stroke={PAPER} strokeWidth="1" />
      <ellipse cx="300" cy="300" rx="160" ry="72" stroke={PAPER} strokeWidth="1" />
      <ellipse cx="300" cy="300" rx="95" ry="36" stroke={PAPER} strokeWidth="1" />
    </svg>
  );
}

// An elongated field oval (with a center line + yard-tick marks) cupped by
// partial bowl arcs above it — reads as "football field seen from the
// stands" rather than generic concentric rings, while staying abstract
// line-art instead of a literal stadium photo.
function StadiumField({ className }) {
  return (
    <svg viewBox="0 0 720 420" fill="none" className={className} aria-hidden="true">
      <defs>
        <clipPath id="dz-field-clip">
          <ellipse cx="360" cy="230" rx="255" ry="88" />
        </clipPath>
      </defs>

      {/* bowl tiers — open arcs, not closed rings, so it reads as seating
          rising behind the field rather than a target/bullseye */}
      <path d="M20 230 A 340 200 0 0 1 700 230" stroke={PAPER} strokeWidth="1" />
      <path d="M85 230 A 275 155 0 0 1 635 230" stroke={PAPER} strokeWidth="1" />

      {/* field outline */}
      <ellipse cx="360" cy="230" rx="255" ry="88" stroke={PAPER} strokeWidth="1.4" />

      {/* yard-line ticks + bolder 50-yard center line, clipped to the field */}
      <g clipPath="url(#dz-field-clip)" stroke={PAPER}>
        <line x1="160" y1="142" x2="160" y2="318" strokeWidth="1" />
        <line x1="240" y1="142" x2="240" y2="318" strokeWidth="1" />
        <line x1="360" y1="142" x2="360" y2="318" strokeWidth="1.6" />
        <line x1="480" y1="142" x2="480" y2="318" strokeWidth="1" />
        <line x1="560" y1="142" x2="560" y2="318" strokeWidth="1" />
      </g>
    </svg>
  );
}

// Goalpost uprights + a dashed trajectory arc — an abstract nod to "the
// path from sign-up to game day" rather than literal stadium photography.
function GoalpostArc({ className }) {
  return (
    <svg viewBox="0 0 400 420" fill="none" className={className} aria-hidden="true">
      <path d="M70 400 V110" stroke={PAPER} strokeWidth="1" />
      <path d="M330 400 V110" stroke={PAPER} strokeWidth="1" />
      <path d="M70 110 H330" stroke={PAPER} strokeWidth="1" />
      <path d="M20 400 Q200 10 380 400" stroke={PAPER} strokeWidth="1" strokeDasharray="3 10" />
    </svg>
  );
}

// Plain concentric circles (deliberately distinct from the hero's ellipses)
// reading as a target/reticle — pairs with the "precision" pitch of the
// capabilities list.
function TargetRings({ className }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" className={className} aria-hidden="true">
      <circle cx="200" cy="200" r="185" stroke={PAPER} strokeWidth="1" />
      <circle cx="200" cy="200" r="135" stroke={PAPER} strokeWidth="1" />
      <circle cx="200" cy="200" r="85" stroke={PAPER} strokeWidth="1" />
      <circle cx="200" cy="200" r="35" stroke={PAPER} strokeWidth="1" />
    </svg>
  );
}

// Evenly spaced hairlines standing in for yard markers, faded at the top/bottom
// edges via mask so they read as texture rather than a hard-edged pattern.
function YardLines({ className }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        backgroundImage: `repeating-linear-gradient(180deg, ${PAPER} 0px, ${PAPER} 1px, transparent 1px, transparent 64px)`,
        maskImage: 'linear-gradient(180deg, transparent, black 25%, black 75%, transparent)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, black 25%, black 75%, transparent)',
      }}
    />
  );
}

export default function Home({ user, onLogout }) {
  const [liveStats, setLiveStats] = useState({ totalDrafts: null, completed: null });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { fadeUp, fadeUpSm, prefersReducedMotion } = useMotionPresets();

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const howRef = useRef(null);
  const capRef = useRef(null);
  const ctaRef = useRef(null);

  const heroMotif = useHeroMotif(heroRef, prefersReducedMotion, 0.09);
  const statsMotif = useSectionMotif(statsRef, prefersReducedMotion, 0.07);
  const howMotif = useSectionMotif(howRef, prefersReducedMotion, 0.08);
  const capMotif = useSectionMotif(capRef, prefersReducedMotion, 0.08);
  const ctaMotif = useSectionMotif(ctaRef, prefersReducedMotion, 0.1);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/drafts')
      .then((res) => {
        const data = res.data;
        setLiveStats({
          totalDrafts: data.length,
          completed: data.filter((d) => d.status === 'COMPLETED').length,
        });
      })
      .catch(() => {});
  }, []);

  const STATS = [
    { value: '1,000+', label: 'NFL players tracked' },
    { value: liveStats.totalDrafts !== null ? String(liveStats.totalDrafts) : '—', label: 'Drafts run to date' },
    { value: liveStats.completed !== null ? String(liveStats.completed) : '—', label: 'Games completed' },
    { value: '24/7', label: 'AI scout availability' },
  ];

  return (
    <div className="w-full" style={{ background: INK, color: PAPER, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .dz-wordmark { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dz-heading { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.03em; }
        @keyframes dz-bounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(8px); opacity: 1; } }
        .dz-scrollcue { animation: dz-bounce 2s ease-in-out infinite; }
      `}</style>

      {/* NAV — bespoke to this page (not the shared AppNav) so the hero can
          run full-bleed with a translucent overlay rather than pushing
          content below a fixed-height bar. */}
      <header
        className="fixed top-0 inset-x-0 z-50"
        style={{ background: 'rgba(8,9,10,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className={`flex items-center gap-3 rounded-lg ${FOCUS_RING}`} onClick={() => setMobileOpen(false)}>
            <Logo size={30} />
            <span className="dz-wordmark text-lg tracking-wide" style={{ color: PAPER }}>
              DRAFT<span style={{ color: ACCENT }}>ZONE</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={`hover:opacity-100 transition-opacity rounded ${FOCUS_RING}`}
                style={{ color: 'rgba(245,245,247,0.6)' }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={onLogout}
                className={`hidden md:inline-block px-5 py-2.5 rounded-full text-sm font-medium border hover:bg-white/5 transition-colors ${FOCUS_RING}`}
                style={{ color: PAPER, borderColor: HAIRLINE }}
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                className={`hidden md:inline-block px-5 py-2.5 rounded-full text-sm font-medium border hover:bg-white/5 transition-colors ${FOCUS_RING}`}
                style={{ color: PAPER, borderColor: HAIRLINE }}
              >
                Log in
              </Link>
            )}

            <button
              type="button"
              className={`md:hidden p-2 rounded-lg ${FOCUS_RING}`}
              style={{ color: PAPER }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: `1px solid ${HAIRLINE}` }}
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={`py-2.5 text-sm font-medium rounded-lg ${FOCUS_RING}`}
                    style={{ color: 'rgba(245,245,247,0.7)' }}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="pt-3 mt-2" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
                  {user ? (
                    <button
                      onClick={() => { setMobileOpen(false); onLogout(); }}
                      className={`w-full px-5 py-2.5 rounded-full text-sm font-medium text-center border ${FOCUS_RING}`}
                      style={{ color: PAPER, borderColor: HAIRLINE }}
                    >
                      Log out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className={`block w-full px-5 py-2.5 rounded-full text-sm font-medium text-center border ${FOCUS_RING}`}
                      style={{ color: PAPER, borderColor: HAIRLINE }}
                    >
                      Log in
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO — full-bleed, immersive; content loads in on mount rather
          than on scroll since it's the first thing visible. */}
      <section ref={heroRef} className="relative flex flex-col justify-center overflow-hidden px-6 pt-32 pb-20" style={{ minHeight: '100svh' }}>
        <div
          className="absolute pointer-events-none rounded-full"
          style={{ top: '15%', right: '8%', width: 480, height: 480, background: ACCENT, opacity: 0.1, filter: 'blur(140px)' }}
        />
        <div className="absolute pointer-events-none" style={{ top: '54%', right: '-14%', width: 'min(65vw, 860px)', transform: 'translateY(-50%)' }}>
          <motion.div style={{ opacity: heroMotif.opacity, y: heroMotif.y }}>
            <StadiumField className="w-full h-auto" />
          </motion.div>
        </div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.8, ease: 'easeOut' }}
          className="relative max-w-5xl"
        >
          <div className="flex items-center gap-2 text-xs font-medium mb-8 uppercase tracking-widest" style={{ color: 'rgba(245,245,247,0.55)' }}>
            <span className={`h-1.5 w-1.5 rounded-full ${prefersReducedMotion ? '' : 'animate-pulse'}`} style={{ background: ACCENT }} aria-hidden="true" />
            AI scout · Live odds · Real NFL players
          </div>

          <h1
            className="dz-heading font-extrabold uppercase mb-8"
            style={{ fontSize: 'clamp(3rem, 9vw, 8rem)', lineHeight: 0.96, color: PAPER }}
          >
            Draft smarter.
            <br />
            Win faster.
          </h1>

          <p className="text-base md:text-lg max-w-xl mb-10 leading-relaxed" style={{ color: 'rgba(245,245,247,0.62)' }}>
            Real-time player rankings, an AI scout that knows your roster, and live odds tracking —
            everything you need to dominate your league, in one place.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/player-search"
              className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity ${FOCUS_RING}`}
              style={{ background: PAPER, color: INK }}
            >
              Start Drafting <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className={`px-4 py-3.5 text-sm font-medium underline decoration-1 underline-offset-4 hover:opacity-70 transition-opacity rounded ${FOCUS_RING}`}
              style={{ color: PAPER, textDecorationColor: 'rgba(245,245,247,0.3)' }}
            >
              How it works
            </a>
          </div>
        </motion.div>

        {!prefersReducedMotion && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 dz-scrollcue" aria-hidden="true">
            <ArrowDown size={20} style={{ color: 'rgba(245,245,247,0.5)' }} />
          </div>
        )}
      </section>

      {/* STATS — big number, small label, no cards. */}
      <section ref={statsRef} className="relative overflow-hidden py-24 md:py-28 px-6" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <motion.div style={{ opacity: statsMotif.opacity, y: statsMotif.y }} className="absolute inset-0 pointer-events-none">
          <YardLines className="absolute inset-0" />
        </motion.div>
        <div className="relative max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-14">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} {...fadeUpSm(i * 0.08)}>
              <div className="dz-heading font-bold tabular-nums" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', color: PAPER }}>
                <AnimatedNumber value={stat.value} reduceMotion={prefersReducedMotion} />
              </div>
              <div className="text-xs uppercase tracking-widest mt-3" style={{ color: 'rgba(245,245,247,0.45)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howRef} id="how-it-works" className="relative overflow-hidden py-24 md:py-32 px-6 scroll-mt-24" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="absolute pointer-events-none" style={{ top: '50%', left: '-10%', width: 'min(50vw, 460px)', transform: 'translateY(-50%)' }}>
          <motion.div style={{ opacity: howMotif.opacity, y: howMotif.y }}>
            <GoalpostArc className="w-full h-auto" />
          </motion.div>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <motion.h2
            {...fadeUp}
            className="dz-heading font-bold mb-16 md:mb-20"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05, color: PAPER }}
          >
            From sign-up to game day.
          </motion.h2>

          <div>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                {...fadeUpSm(i * 0.1)}
                className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-10 py-9"
                style={{ borderTop: i > 0 ? `1px solid ${HAIRLINE}` : undefined }}
              >
                <span className="dz-heading font-bold flex-shrink-0" style={{ fontSize: '2.25rem', color: 'rgba(245,245,247,0.18)', minWidth: '3.5rem' }}>
                  0{i + 1}
                </span>
                <div>
                  <h3 className="dz-heading text-xl font-semibold mb-2" style={{ color: PAPER }}>
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed max-w-lg" style={{ color: 'rgba(245,245,247,0.55)' }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section ref={capRef} id="capabilities" className="relative overflow-hidden py-24 md:py-32 px-6 scroll-mt-24" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="absolute pointer-events-none" style={{ top: '50%', right: '-8%', width: 'min(45vw, 420px)', transform: 'translateY(-50%)' }}>
          <motion.div style={{ opacity: capMotif.opacity, y: capMotif.y }}>
            <TargetRings className="w-full h-auto" />
          </motion.div>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <motion.h2
            {...fadeUp}
            className="dz-heading font-bold mb-16 md:mb-20"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05, color: PAPER }}
          >
            Everything you need to win.
          </motion.h2>

          <div>
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                {...fadeUpSm(i * 0.1)}
                className="group flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 md:gap-10 py-9"
                style={{ borderTop: i > 0 ? `1px solid ${HAIRLINE}` : undefined }}
              >
                <div className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-10">
                  <span className="dz-heading font-bold flex-shrink-0" style={{ fontSize: '2.25rem', color: 'rgba(245,245,247,0.18)', minWidth: '3.5rem' }}>
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="dz-heading text-xl font-semibold mb-2" style={{ color: PAPER }}>
                      {cap.title}
                    </h3>
                    <p className="text-sm md:text-base leading-relaxed max-w-lg" style={{ color: 'rgba(245,245,247,0.55)' }}>
                      {cap.description}
                    </p>
                  </div>
                </div>
                <Link
                  to={cap.to}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap md:pl-6 rounded ${FOCUS_RING}`}
                  style={{ color: ACCENT }}
                >
                  {cap.cta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="relative overflow-hidden py-28 md:py-36 px-6 text-center" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="absolute pointer-events-none" style={{ top: '50%', left: '50%', width: 'min(70vw, 800px)', transform: 'translate(-50%, -50%)' }}>
          <motion.div style={{ opacity: ctaMotif.opacity, y: ctaMotif.y }}>
            <StadiumRings className="w-full h-auto" />
          </motion.div>
        </div>
        <motion.div {...fadeUp} className="relative max-w-3xl mx-auto">
          <h2
            className="dz-heading font-extrabold uppercase mb-6"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)', lineHeight: 1, color: PAPER }}
          >
            Ready to build
            <br />
            a roster that wins?
          </h2>
          <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: 'rgba(245,245,247,0.55)' }}>
            Join fantasy managers who draft smarter with DraftZone.
          </p>
          <Link
            to="/draft"
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity ${FOCUS_RING}`}
            style={{ background: ACCENT, color: '#062012' }}
          >
            Start Your Draft <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative px-6 pt-16 pb-8" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Logo size={26} />
                <span className="dz-wordmark text-lg" style={{ color: PAPER }}>
                  DRAFT<span style={{ color: ACCENT }}>ZONE</span>
                </span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'rgba(245,245,247,0.45)' }}>
                AI-powered mock drafts and live odds tracking for fantasy football managers.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(245,245,247,0.4)' }}>Product</div>
              <div className="flex flex-col gap-2.5">
                {[{ label: 'Draft simulator', to: '/draft' }, { label: 'Player search', to: '/player-search' }, { label: 'Odds', to: '/odds' }, { label: 'My bets', to: '/my-bets' }].map((l) => (
                  <Link key={l.label} to={l.to} className={`text-sm hover:opacity-80 transition-opacity rounded ${FOCUS_RING}`} style={{ color: 'rgba(245,245,247,0.6)' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(245,245,247,0.4)' }}>Project</div>
              <div className="flex flex-col gap-2.5">
                <Link to="/authors" className={`text-sm hover:opacity-80 transition-opacity rounded ${FOCUS_RING}`} style={{ color: 'rgba(245,245,247,0.6)' }}>Authors</Link>
                <Link to="/login" className={`text-sm hover:opacity-80 transition-opacity rounded ${FOCUS_RING}`} style={{ color: 'rgba(245,245,247,0.6)' }}>Log in</Link>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
            <span className="text-xs" style={{ color: 'rgba(245,245,247,0.4)' }}>© 2025 DraftZone. Built as a class project.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
