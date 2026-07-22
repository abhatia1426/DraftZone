import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Sparkles, UserPlus, LineChart, Check, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Logo from './components/Logo';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Players', to: '/player-search' },
  { label: 'Draft', to: '/draft' },
  { label: 'Odds', to: '/odds' },
  { label: 'Authors', to: '/authors' },
  { label: 'Bets', to: '/my-bets' },
];

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up and choose your mode — head-to-head PvP or against the AI.',
  },
  {
    icon: Sparkles,
    title: 'Draft with AI insights',
    description: 'Your AI Scout recommends picks in real time based on your roster needs.',
  },
  {
    icon: LineChart,
    title: 'Track odds & bets',
    description: 'Follow live game odds and manage your bet history, all in one place.',
  },
];

const FEATURES = [
  {
    icon: '🏆',
    title: 'Real-time rankings',
    description: 'Live player rankings updated every minute with expert projections and injury reports.',
  },
  {
    icon: '📊',
    title: 'Advanced analytics',
    description: 'Deep dive into player stats, trends, and matchup analysis powered by machine learning.',
  },
  {
    icon: '🧠',
    title: 'AI draft assistant',
    description: 'Get personalized recommendations based on your league settings and draft position.',
  },
];

export default function Home({ user, onLogout }) {
  const [liveStats, setLiveStats] = useState({ totalDrafts: null, completed: null });

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
    { value: '1,000+', label: 'NFL players' },
    { value: liveStats.totalDrafts !== null ? `${liveStats.totalDrafts}` : '—', label: 'Drafts run' },
    { value: liveStats.completed !== null ? `${liveStats.completed}` : '—', label: 'Completed games' },
  ];

  return (
    <div className="w-full" style={{ background: '#F5F2EC', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .dz-wordmark { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dz-heading { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(245,242,236,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} />
            <span className="dz-wordmark text-2xl" style={{ color: '#1A1814' }}>
              DRAFT<span style={{ color: '#2D6A2D' }}>ZONE</span>
            </span>
          </Link>

          <div className="hidden md:flex gap-8 text-sm font-medium" style={{ color: '#6B6456' }}>
            {NAV_LINKS.map((item) => (
              <Link key={item.label} to={item.to} className="hover:opacity-70 transition-opacity" style={{ color: '#6B6456' }}>
                {item.label}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm" style={{ color: '#6B6456' }}>{user.name}</span>
              <button
                onClick={onLogout}
                className="px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ background: '#1A1814', color: '#FDFAF5' }}
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-block px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ background: '#1A1814', color: '#FDFAF5' }}
            >
              Get Started
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div className="relative text-center px-4 pt-16 pb-0 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-medium mb-5" style={{ color: '#6B6456' }}>
          <Sparkles size={14} style={{ color: '#2D6A2D' }} />
          <span>AI-powered draft assistant</span>
        </div>

        <h1 className="dz-heading text-5xl md:text-6xl font-bold leading-[1.1] mb-5" style={{ color: '#1A1814' }}>
          The smartest way<br />to draft your team
        </h1>

        <p className="text-base max-w-md mx-auto mb-8 leading-relaxed" style={{ color: '#6B6456' }}>
          Real-time rankings and an AI scout that knows your roster, pick by pick.
        </p>

        <div className="flex gap-3 justify-center items-center mb-2">
          <Link
            to="/player-search"
            className="px-7 py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: '#1A1814', color: '#FDFAF5' }}
          >
            Start Drafting
          </Link>
          <a
            href="#features"
            className="px-4 py-3.5 text-sm font-medium underline decoration-1 underline-offset-4 hover:opacity-70 transition-opacity"
            style={{ color: '#1A1814', textDecorationColor: 'rgba(26,24,20,0.3)' }}
          >
            Explore Features
          </a>
        </div>
      </div>

      {/* FLOATING PRODUCT PREVIEW */}
      <div className="relative" style={{ height: 210, marginTop: 16 }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #F5F2EC 0%, #E4E9DD 60%, #CFE0C2 100%)' }} />
        <div
          className="absolute left-1/2 w-full max-w-2xl px-4"
          style={{ transform: 'translateX(-50%)', bottom: -110, zIndex: 20 }}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(253,250,245,0.72)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(26,24,20,0.1)',
              boxShadow: '0 20px 50px rgba(26,24,20,0.16), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            <div className="flex gap-4 mb-4">
              <div className="flex-[1.3]">
                <div className="text-[10px] font-semibold mb-2 tracking-wider" style={{ color: '#A89E8E' }}>
                  ON THE CLOCK
                </div>
                {[
                  { name: 'Josh Allen', pos: 'QB', posColor: '#2D6A2D', posBg: '#EBF5EB' },
                  { name: 'Bijan Robinson', pos: 'RB', posColor: '#389E0D', posBg: '#F6FFED' },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg mb-1.5"
                    style={{ background: 'rgba(253,250,245,0.9)', border: '1px solid rgba(26,24,20,0.06)' }}
                  >
                    <div className="w-6 h-6 rounded-full" style={{ background: '#E8E2D5' }} />
                    <div className="flex-1 text-xs" style={{ color: '#1A1814' }}>{p.name}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: p.posColor, background: p.posBg }}>
                      {p.pos}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="flex-1 rounded-lg p-2.5"
                style={{ background: 'rgba(253,250,245,0.9)', border: '1px solid rgba(26,24,20,0.06)' }}
              >
                <div className="text-[10px] font-semibold mb-1.5 tracking-wider" style={{ color: '#A89E8E' }}>
                  AI SCOUT
                </div>
                <div className="text-xs leading-relaxed" style={{ color: '#1A1814' }}>
                  Take the RB here — your WR corps is already strong through round 2.
                </div>
              </div>
            </div>

            <div className="flex" style={{ borderTop: '1px solid rgba(26,24,20,0.08)', paddingTop: 12 }}>
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex-1 text-center"
                  style={i > 0 ? { borderLeft: '1px solid rgba(26,24,20,0.08)' } : undefined}
                >
                  <div className="dz-heading text-lg font-bold" style={{ color: '#2D6A2D' }}>{stat.value}</div>
                  <div className="text-[10px]" style={{ color: '#8A8272' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="relative pt-40 pb-28 px-6 overflow-hidden" style={{ background: '#CFE0C2' }}>
        <div className="absolute rounded-full pointer-events-none" style={{ top: -60, left: '8%', width: 320, height: 320, background: '#2D6A2D', opacity: 0.16, filter: 'blur(90px)' }} />
        <div className="absolute rounded-full pointer-events-none" style={{ bottom: -80, right: '10%', width: 300, height: 300, background: '#7EC8C8', opacity: 0.18, filter: 'blur(90px)' }} />

        <motion.div {...fadeUp} className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#2D6A2D' }}>
              Why DraftZone
            </div>
            <h2 className="dz-heading text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1A1814' }}>
              Everything you need to win
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#4A4638' }}>
              Powerful tools and insights that give you the competitive edge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl"
                style={{
                  background: 'rgba(253,250,245,0.55)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(26,24,20,0.1)',
                  boxShadow: '0 12px 32px rgba(26,24,20,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <div className="text-4xl mb-5">{feature.icon}</div>
                <h3 className="dz-heading text-xl font-semibold mb-3" style={{ color: '#1A1814' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#4A4638' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-28 px-6" style={{ background: '#F5F2EC' }}>
        <motion.div {...fadeUp} className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#2D6A2D' }}>
              How it works
            </div>
            <h2 className="dz-heading text-4xl md:text-5xl font-bold" style={{ color: '#1A1814' }}>
              From sign-up to game day
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: '#1A1814' }}
                  >
                    <Icon size={22} style={{ color: '#3FCB6E' }} />
                  </div>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#A89E8E' }}>STEP {i + 1}</div>
                  <h3 className="dz-heading text-lg font-semibold mb-2" style={{ color: '#1A1814' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: '#6B6456' }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* PRODUCT SHOWCASE — DRAFT SIMULATOR */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: '#CFE0C2' }}>
        <motion.div {...fadeUp} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#2D6A2D' }}>
              Draft simulator
            </div>
            <h2 className="dz-heading text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: '#1A1814' }}>
              Draft against a friend or the AI
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: '#3E4A38' }}>
              A full mock draft board pulling real NFL players — with an AI Scout chatting alongside you the whole way, so you never pick blind.
            </p>
            <ul className="space-y-3">
              {[
                'Real NFL player pool with live stats',
                'PvP or Player-vs-AI draft modes',
                'Auto roster slotting, round by round',
                'AI Scout answers questions on any pick',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#1A1814' }}>
                  <Check size={16} style={{ color: '#2D6A2D', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: '#FDFAF5', border: '1px solid rgba(26,24,20,0.08)', boxShadow: '0 20px 50px rgba(26,24,20,0.12)' }}
          >
            <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
              <span className="dz-heading text-sm font-semibold" style={{ color: '#1A1814' }}>Round 2 · Pick 3</span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ color: '#2D6A2D', background: '#EBF5EB' }}>Your pick</span>
            </div>
            {[
              { name: 'Christian McCaffrey', pos: 'RB', posColor: '#389E0D', posBg: '#F6FFED', pts: '24.6' },
              { name: "Ja'Marr Chase", pos: 'WR', posColor: '#096DD9', posBg: '#E6F7FF', pts: '22.1' },
              { name: 'Travis Kelce', pos: 'TE', posColor: '#D46B08', posBg: '#FFF7E6', pts: '17.4' },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(26,24,20,0.05)' }}>
                <div className="w-8 h-8 rounded-full" style={{ background: '#E8E2D5' }} />
                <span className="flex-1 text-xs" style={{ color: '#1A1814' }}>{p.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: p.posColor, background: p.posBg }}>{p.pos}</span>
                <span className="text-xs font-mono" style={{ color: '#6B6456' }}>{p.pts}</span>
              </div>
            ))}
            <div className="mt-3 rounded-lg p-3" style={{ background: '#EBF5EB' }}>
              <div className="text-[10px] font-semibold mb-1" style={{ color: '#2D6A2D' }}>AI SCOUT</div>
              <div className="text-xs leading-relaxed" style={{ color: '#1A4A1E' }}>
                McCaffrey's the clear top pick — your WR room is already covered.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ODDS + BETTING */}
      <section className="relative py-24 px-6" style={{ background: '#F5F2EC' }}>
        <motion.div {...fadeUp} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div
            className="rounded-2xl p-4 order-2 md:order-1"
            style={{ background: '#FDFAF5', border: '1px solid rgba(26,24,20,0.08)', boxShadow: '0 20px 50px rgba(26,24,20,0.1)' }}
          >
            <div className="text-[10px] font-semibold mb-3 tracking-wider" style={{ color: '#A89E8E' }}>LIVE ODDS</div>
            {[
              { team: 'Bills @ Chiefs', line: 'BUF -2.5', trend: 'up' },
              { team: 'Eagles @ Cowboys', line: 'PHI -3.5', trend: 'down' },
            ].map((g) => (
              <div key={g.team} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(26,24,20,0.06)' }}>
                <span className="text-xs" style={{ color: '#1A1814' }}>{g.team}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-medium" style={{ color: '#1A1814' }}>{g.line}</span>
                  {g.trend === 'up'
                    ? <TrendingUp size={13} style={{ color: '#2D6A2D' }} />
                    : <TrendingDown size={13} style={{ color: '#C4570A' }} />}
                </div>
              </div>
            ))}
            <div className="mt-3 rounded-lg p-3 flex items-center gap-3" style={{ background: '#EBF5EB' }}>
              <Wallet size={18} style={{ color: '#2D6A2D', flexShrink: 0 }} />
              <div>
                <div className="text-xs font-semibold" style={{ color: '#1A1814' }}>Bet placed — BUF -2.5</div>
                <div className="text-[10px]" style={{ color: '#6B6456' }}>$25 to win $46.60</div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#2D6A2D' }}>
              Odds &amp; betting
            </div>
            <h2 className="dz-heading text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: '#1A1814' }}>
              Bet smarter with live odds
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4A4638' }}>
              Browse real-time spreads and moneylines, place your bets, and keep every wager organized in one dashboard.
            </p>
            <ul className="space-y-3">
              {[
                'Real-time spreads, moneylines, and totals',
                'Place bets in a couple of taps',
                'Full bet history and running balance',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#1A1814' }}>
                  <Check size={16} style={{ color: '#2D6A2D', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ background: '#F5F2EC' }}>
        <div className="absolute rounded-full pointer-events-none" style={{ top: '10%', left: '50%', width: 500, height: 500, transform: 'translateX(-50%)', background: '#2D6A2D', opacity: 0.16, filter: 'blur(110px)' }} />

        <motion.div
          {...fadeUp}
          className="relative max-w-4xl mx-auto text-center rounded-3xl px-10 py-16"
          style={{
            background: 'rgba(26,24,20,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 60px rgba(26,24,20,0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          <h2 className="dz-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FDFAF5' }}>
            Ready to dominate your draft?
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: '#C7C2B4' }}>
            Join thousands of fantasy managers who trust DraftZone.
          </p>
          <Link
            to="/draft"
            className="inline-block px-8 py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: '#3FCB6E', color: '#0C2313' }}
          >
            Start Your Draft Legacy
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative px-6 pt-16 pb-8" style={{ background: '#1A1814' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Logo size={28} />
                <span className="dz-wordmark text-xl" style={{ color: '#FDFAF5' }}>
                  DRAFT<span style={{ color: '#3FCB6E' }}>ZONE</span>
                </span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#8A8272' }}>
                AI-powered mock drafts and live odds tracking for fantasy football managers.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#8A8272' }}>Product</div>
              <div className="flex flex-col gap-2.5">
                {[{ label: 'Draft simulator', to: '/draft' }, { label: 'Player search', to: '/player-search' }, { label: 'Odds', to: '/odds' }, { label: 'My bets', to: '/my-bets' }].map((l) => (
                  <Link key={l.label} to={l.to} className="text-sm hover:opacity-80 transition-opacity" style={{ color: '#C7C2B4' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#8A8272' }}>Project</div>
              <div className="flex flex-col gap-2.5">
                <Link to="/authors" className="text-sm hover:opacity-80 transition-opacity" style={{ color: '#C7C2B4' }}>Authors</Link>
                <Link to="/login" className="text-sm hover:opacity-80 transition-opacity" style={{ color: '#C7C2B4' }}>Log in</Link>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs" style={{ color: '#6B6456' }}>© 2025 DraftZone. Built as a class project.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
