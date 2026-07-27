import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// `motion` is used throughout via JSX tags like <motion.div>, which this
// project's no-unused-vars config (no eslint-plugin-react) doesn't track.
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, Check, Flame, Target, Plus, Info, Users, Gem, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ThemeToggle from '../components/ThemeToggle';
import DynamicIsland from '../components/DynamicIsland';

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Theme: Warm editorial light — cream surfaces, charcoal type, grass-green accents
// Fonts: Instrument Serif (display) + DM Mono (data) + Geist (body)

const THEME = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* Color, shadow, and radius tokens now live in src/index.css so they
       respond to the app-wide dark mode toggle. Only fonts stay local. */
    --font-body:    'Geist', system-ui, sans-serif;
    --font-display: 'Instrument Serif', Georgia, serif;
    --font-mono:    'DM Mono', 'Courier New', monospace;
  }

  body { font-family: var(--font-body); background: var(--bg-base); color: var(--text-primary); }

  .dz-scrollbar::-webkit-scrollbar { width: 4px; }
  .dz-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .dz-scrollbar::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: var(--radius-pill); }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .dz-fade { animation: fadeSlideUp 0.18s ease both; }
  .dz-blink { animation: blink 1.2s infinite; }

  .dz-dot-pulse { display: flex; gap: 4px; align-items: center; }
  .dz-dot-pulse span {
    display: inline-block; width: 4px; height: 4px;
    border-radius: 50%; background: var(--text-muted);
    animation: blink 1.2s ease infinite;
  }
  .dz-dot-pulse span:nth-child(2) { animation-delay: 0.2s; }
  .dz-dot-pulse span:nth-child(3) { animation-delay: 0.4s; }

  @media (prefers-reduced-motion: reduce) {
    .dz-fade, .dz-blink, .dz-dot-pulse span { animation: none !important; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPlayerImage = (player) => {
  if (!player) return 'https://sleepercdn.com/images/v2/icons/player_default.webp';
  if (player.position === 'DEF' && player.team)
    return `https://sleepercdn.com/images/team_logos/nfl/${player.team.toLowerCase()}.png`;
  return `https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`;
};

const calcScore = (roster) => {
  const keys = ['QB','RB1','RB2','WR1','WR2','TE','FLEX','DST','K'];
  return keys.reduce((s, k) => s + (roster[k]?.stats?.pts_ppr || 0), 0).toFixed(1);
};

const countPlayers = (roster) => {
  const keys = ['QB','RB1','RB2','WR1','WR2','TE','FLEX','DST','K'];
  return keys.filter(k => roster[k]).length + roster.BENCH.length;
};

const getEmptyRoster = () => ({
  QB:null, RB1:null, RB2:null, WR1:null, WR2:null,
  TE:null, FLEX:null, DST:null, K:null, BENCH:[]
});

const POS_META = {
  QB:  { color: '#D4380D', bg: '#FFF2E8' },
  RB:  { color: '#389E0D', bg: '#F6FFED' },
  WR:  { color: '#096DD9', bg: '#E6F7FF' },
  TE:  { color: '#D46B08', bg: '#FFF7E6' },
  DEF: { color: '#531DAB', bg: '#F9F0FF' },
  K:   { color: '#08979C', bg: '#E6FFFB' },
};

// Secondary per-position stat pair, revealed in the player card's hover
// slide-out panel — the same real fields the player modal already breaks
// out, just condensed to the two most position-relevant numbers.
const getSecondaryStats = (player) => {
  const s = player.stats || {};
  if (player.position === 'QB') return [{ label:'Pass Yds', value:s.pass_yd||0 }, { label:'Pass TDs', value:s.pass_td||0 }];
  if (player.position === 'RB') return [{ label:'Rush Yds', value:s.rush_yd||0 }, { label:'Rush TDs', value:s.rush_td||0 }];
  if (player.position === 'WR' || player.position === 'TE') return [{ label:'Rec Yds', value:s.rec_yd||0 }, { label:'Receptions', value:s.rec||0 }];
  if (player.position === 'DEF') return [{ label:'Sacks', value:s.sack||0 }, { label:'INTs', value:s.int||0 }];
  return [];
};

// Rank/points-based tier — the real-data analog of a card game's foil/gold
// treatment: top of the board glows brighter than replacement-level players.
const getTier = (rank, ptsPct) => {
  if (rank <= 12 || ptsPct >= 85) return 'elite';
  if (rank <= 36 || ptsPct >= 50) return 'starter';
  return 'bench';
};

const safeDiv = (a, b) => (b > 0 ? a / b : 0);

// Full position-relevant stat breakdown for the player detail modal — goes
// beyond the pts/rank summary shown in the list row, including derived
// efficiency numbers (YPC, catch rate, comp%) computed from real fields.
const getExpandedStats = (player) => {
  const s = player.stats || {};
  if (player.position === 'QB') return [
    { label:'Pass Yds', val: s.pass_yd || 0 },
    { label:'Pass TDs', val: s.pass_td || 0 },
    { label:'INTs', val: s.pass_int || 0 },
    { label:'Attempts', val: s.pass_att || 0 },
    { label:'Comp %', val: `${safeDiv(s.pass_cmp, s.pass_att).toFixed(0)}%` },
    { label:'Yds/Att', val: safeDiv(s.pass_yd, s.pass_att).toFixed(1) },
  ];
  if (player.position === 'RB') return [
    { label:'Rush Yds', val: s.rush_yd || 0 },
    { label:'Rush TDs', val: s.rush_td || 0 },
    { label:'Carries', val: s.rush_att || 0 },
    { label:'Yds/Carry', val: safeDiv(s.rush_yd, s.rush_att).toFixed(1) },
    { label:'Receptions', val: s.rec || 0 },
    { label:'Rec Yds', val: s.rec_yd || 0 },
  ];
  if (player.position === 'WR' || player.position === 'TE') return [
    { label:'Receptions', val: s.rec || 0 },
    { label:'Rec Yds', val: s.rec_yd || 0 },
    { label:'Rec TDs', val: s.rec_td || 0 },
    { label:'Targets', val: s.rec_tgt || 0 },
    { label:'Yds/Rec', val: safeDiv(s.rec_yd, s.rec).toFixed(1) },
    { label:'Catch %', val: `${safeDiv(s.rec, s.rec_tgt).toFixed(0)}%` },
  ];
  if (player.position === 'DEF') return [
    { label:'Sacks', val: s.sack || 0 },
    { label:'INTs', val: s.int || 0 },
    { label:'Fum Rec', val: s.fum_rec || 0 },
    { label:'Def TDs', val: s.def_td || 0 },
    { label:'Safeties', val: s.safe || 0 },
    { label:'Pts Allow', val: s.pts_allow || 0 },
  ];
  return [
    { label:'FG Made', val: s.fgm || 0 },
    { label:'FG Att', val: s.fga || 0 },
    { label:'FG %', val: `${safeDiv(s.fgm, s.fga).toFixed(0)}%` },
    { label:'XP Made', val: s.xpm || 0 },
  ];
};

// Short, stat-derived playstyle read — thresholds on real per-position
// ratios rather than fabricated flavor text.
const getPlaystyleSummary = (player) => {
  const s = player.stats || {};
  const name = player.full_name.split(' ').slice(-1)[0];
  if (player.position === 'QB') {
    const ypa = safeDiv(s.pass_yd, s.pass_att);
    const tdRate = safeDiv(s.pass_td, s.pass_att) * 100;
    const turnoverProne = s.pass_int >= 12;
    return `${name} averages ${ypa.toFixed(1)} yards per attempt with a ${tdRate.toFixed(1)}% touchdown rate on ${s.pass_att || 0} attempts. ${ypa >= 7.5 ? 'A downfield thrower who pushes the ball vertically' : 'A more conservative, short-to-intermediate passer'}, ${turnoverProne ? 'though turnovers have been a concern.' : 'and has kept turnovers relatively in check.'}`;
  }
  if (player.position === 'RB') {
    const ypc = safeDiv(s.rush_yd, s.rush_att);
    const receivingShare = safeDiv(s.rec_yd, (s.rush_yd + s.rec_yd) || 1) * 100;
    return `${name} carries the ball ${s.rush_att || 0} times for ${ypc.toFixed(1)} yards per carry. ${receivingShare >= 25 ? `A genuine dual-threat back, with ${receivingShare.toFixed(0)}% of yardage coming through the air on ${s.rec || 0} catches.` : 'Primarily a between-the-tackles runner with a limited receiving role.'}`;
  }
  if (player.position === 'WR' || player.position === 'TE') {
    const ypr = safeDiv(s.rec_yd, s.rec);
    const catchRate = safeDiv(s.rec, s.rec_tgt) * 100;
    return `${name} has been targeted ${s.rec_tgt || 0} times, hauling in ${s.rec || 0} catches (${catchRate.toFixed(0)}% catch rate) for ${ypr.toFixed(1)} yards per reception. ${ypr >= 13 ? 'A big-play threat who wins down the field' : 'A high-volume, possession-style target who wins with reliability over explosiveness'}.`;
  }
  if (player.position === 'DEF') {
    return `This defense has generated ${s.sack || 0} sacks and ${s.int || 0} interceptions, forcing ${(s.fum_rec||0)+(s.int||0)} total takeaways while allowing ${s.pts_allow || 0} points. ${(s.sack||0) >= 30 ? 'A disruptive pass rush is the identity of this unit.' : 'A more opportunistic unit that leans on takeaways over pressure.'}`;
  }
  return `${name} has made ${s.fgm || 0} of ${s.fga || 0} field goal attempts (${(safeDiv(s.fgm, s.fga) * 100).toFixed(0)}%) and ${s.xpm || 0} extra points this season.`;
};

// ─── Shared button styles ─────────────────────────────────────────────────────

const S = {
  btnPrimary: {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'7px 14px', background:'var(--accent)', color:'var(--text-inverse)',
    border:'none', borderRadius:'var(--radius-sm)',
    fontSize:11, fontWeight:600, fontFamily:'var(--font-body)',
    letterSpacing:'0.04em', cursor:'pointer', whiteSpace:'nowrap',
  },
  btnGhost: {
    display:'inline-flex', alignItems:'center',
    padding:'6px 10px', background:'transparent', color:'var(--text-secondary)',
    border:'1px solid var(--border-default)', borderRadius:'var(--radius-sm)',
    fontSize:11, fontWeight:600, fontFamily:'var(--font-body)',
    letterSpacing:'0.04em', cursor:'pointer',
  },
  btnDisabled: {
    display:'inline-flex', alignItems:'center',
    padding:'7px 14px', background:'var(--bg-inset)', color:'var(--text-muted)',
    border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-sm)',
    fontSize:11, fontWeight:600, fontFamily:'var(--font-body)',
    letterSpacing:'0.04em', cursor:'not-allowed',
  },
  input: {
    padding:'8px 12px', background:'var(--bg-inset)',
    border:'1px solid var(--border-default)', borderRadius:'var(--radius-sm)',
    fontSize:12, color:'var(--text-primary)', fontFamily:'var(--font-body)', outline:'none',
  },
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

const PosBadge = memo(({ pos }) => {
  const m = POS_META[pos] || POS_META.K;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background: m.bg, color: m.color,
      fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)',
      padding:'3px 9px 3px 7px', borderRadius:'var(--radius-pill)',
      letterSpacing:'0.05em', border:`1px solid ${m.color}2a`, whiteSpace:'nowrap',
      boxShadow:`0 1px 2px ${m.color}1a, inset 0 1px 0 rgba(255,255,255,0.35)`,
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:m.color, flexShrink:0 }} />
      {pos}
    </span>
  );
});

// A pill-shaped stat readout with an icon and, optionally, a mini bar
// showing the value relative to the strongest player currently in view —
// a quick visual "how good is this, really" instead of a bare number.
const StatChip = memo((props) => {
  const { icon: Icon, value, pct, tone = 'var(--text-primary)' } = props;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'4px 9px', borderRadius:'var(--radius-pill)',
      background:'rgba(var(--text-primary-rgb), 0.05)', border:'1px solid rgba(var(--text-primary-rgb), 0.08)',
    }}>
      <Icon size={11} style={{ color:tone, flexShrink:0 }} />
      <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{value}</span>
      {pct != null && (
        <span style={{ width:34, height:4, borderRadius:2, background:'rgba(var(--text-primary-rgb), 0.1)', overflow:'hidden', flexShrink:0 }}>
          <span style={{ display:'block', height:'100%', width:`${Math.max(4, Math.min(100, pct))}%`, background: tone, borderRadius:2 }} />
        </span>
      )}
    </span>
  );
});

// ─── Player Card ──────────────────────────────────────────────────────────────
// Each player is its own elevated glass card — not a spreadsheet row — with a
// large headshot, pill stat chips (with icons + a mini bar relative to the
// strongest player currently in view), and a prominent circular draft action.

const PlayerRow = memo(({ player, rank, onDraft, onDraftStart, onSelect, isDisabled, maxPts }) => {
  const [hov, setHov] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const draftBtnRef = useRef(null);
  const meta = POS_META[player.position] || POS_META.K;
  const pts = player.stats?.pts_ppr || 0;
  const ptsPct = maxPts > 0 ? (pts / maxPts) * 100 : 0;
  const tier = getTier(rank, ptsPct);
  const tierColor = tier === 'elite' ? 'var(--accent-bright)' : tier === 'starter' ? meta.color : 'var(--border-default)';
  const secondary = getSecondaryStats(player);
  const tilt = hov && !prefersReducedMotion;

  // Mouse-tracking 3D tilt/parallax — cursor position within the card drives
  // spring-smoothed rotation (same underlying technique as motion-primitives'
  // Tilt component: raw pointer offset -> motion value -> spring), rather
  // than a fixed hover angle.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 22, mass: 0.6 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 22, mass: 0.6 });

  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 8);
    rotateX.set((0.5 - py) * 7);
  };
  const handleMouseLeave = () => {
    setHov(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  const handleDraftClick = () => {
    if (isDisabled || confirming) return;
    setConfirming(true);
    if (!prefersReducedMotion && draftBtnRef.current) {
      onDraftStart?.(player, draftBtnRef.current.getBoundingClientRect());
    }
    setTimeout(() => onDraft(player), prefersReducedMotion ? 0 : 480);
  };

  return (
    <motion.div
      layout={!prefersReducedMotion}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16, scale: prefersReducedMotion ? 1 : 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: prefersReducedMotion ? 0 : ((rank - 1) % 12) * 0.025 }}
      style={{ marginBottom: 10, perspective: 900 }}
    >
      {/* 3D-tilt shell — structural reference: dhileepkumargm/profile-card's
          hover tilt, upgraded to follow the cursor across the card instead
          of snapping to one fixed angle. */}
      <motion.div
        onMouseEnter={() => setHov(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ scale: tilt ? 1.014 : 1, y: tilt ? -3 : 0 }}
        transition={{ type:'spring', stiffness:320, damping:24 }}
        style={{
          position:'relative', borderRadius:18, overflow:'hidden',
          transformStyle:'preserve-3d',
          rotateX: prefersReducedMotion ? 0 : springRotateX,
          rotateY: prefersReducedMotion ? 0 : springRotateY,
          background: confirming ? 'rgba(var(--accent-rgb), 0.12)' : 'rgba(var(--bg-surface-rgb), 0.65)',
          backdropFilter:'blur(18px) saturate(1.3)', WebkitBackdropFilter:'blur(18px) saturate(1.3)',
          border: `1px solid ${confirming ? 'rgba(var(--accent-rgb), 0.4)' : hov ? 'rgba(var(--text-primary-rgb), 0.18)' : 'rgba(var(--text-primary-rgb), 0.08)'}`,
          boxShadow: hov ? '0 24px 48px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)' : '0 4px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)',
          transition:'background 0.2s ease, border-color 0.2s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Tier-glow edge bar — real-data analog of the reference's gold
            tier stripe: rank/points-driven instead of a fixed prop. */}
        <span aria-hidden style={{
          position:'absolute', top:0, right:0, bottom:0, width:3,
          background:tierColor, opacity: tier==='bench' ? 0.25 : 0.95,
          boxShadow: tier!=='bench' ? `0 0 12px 1px ${tierColor}` : 'none',
          pointerEvents:'none',
        }} />

        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px 13px 14px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)', width:16, flexShrink:0, textAlign:'center' }}>{rank}</span>

          <div style={{ position:'relative', flexShrink:0 }}>
            <img
              src={getPlayerImage(player)} alt=""
              style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', background:'var(--bg-inset)', boxShadow:`0 0 0 2px var(--bg-surface), 0 0 0 3.5px ${tierColor}` }}
              onError={e => e.target.src='https://sleepercdn.com/images/v2/icons/player_default.webp'}
              loading="lazy"
            />
            {tier === 'elite' && !prefersReducedMotion && (
              <motion.span
                aria-hidden
                animate={{ opacity:[0.6,0,0.6], scale:[1,1.25,1] }}
                transition={{ repeat:Infinity, duration:2.6, ease:'easeInOut' }}
                style={{ position:'absolute', inset:-4, borderRadius:'50%', border:`1px solid ${tierColor}`, pointerEvents:'none' }}
              />
            )}
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
              <span style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', letterSpacing:'-0.01em' }}>{player.full_name}</span>
              <PosBadge pos={player.position} />
              <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)', flexShrink:0 }}>{player.team || 'FA'}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <StatChip icon={Flame} value={pts ? pts.toFixed(1) : '—'} pct={pts ? ptsPct : null} tone={meta.color} />
              <StatChip icon={Target} value={player.search_rank && player.search_rank < 9999 ? `#${player.search_rank}` : '—'} tone="var(--text-secondary)" />
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <AnimatePresence mode="wait" initial={false}>
              {confirming ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  style={{
                    display:'flex', alignItems:'center', gap:5, padding:'8px 13px',
                    borderRadius:'var(--radius-pill)', background:'var(--accent)', color:'var(--text-inverse)',
                    fontSize:10, fontWeight:700, letterSpacing:'0.04em', whiteSpace:'nowrap',
                  }}
                >
                  <Check size={13} strokeWidth={3} /> DRAFTED
                </motion.div>
              ) : (
                <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <motion.button
                    whileHover={{ scale:1.08, backgroundColor:'rgba(var(--text-primary-rgb), 0.1)' }}
                    whileTap={{ scale:0.92 }}
                    onClick={() => onSelect(player)}
                    aria-label={`View ${player.full_name} details`}
                    style={{
                      width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                      background:'rgba(var(--text-primary-rgb), 0.05)', border:'1px solid rgba(var(--text-primary-rgb), 0.1)',
                      color:'var(--text-secondary)', cursor:'pointer', flexShrink:0,
                    }}
                  >
                    <Info size={14} />
                  </motion.button>
                  {/* Floating draft CTA — structural reference: the profile
                      card's action button that pops proud of the card body
                      rather than sitting flush inside it. */}
                  <motion.button
                    ref={draftBtnRef}
                    whileTap={isDisabled ? {} : { scale: 0.9 }}
                    whileHover={isDisabled ? {} : { scale: 1.1, x: 3 }}
                    onClick={handleDraftClick}
                    disabled={isDisabled}
                    aria-label={`Draft ${player.full_name}`}
                    style={{
                      width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                      border:'none', flexShrink:0, cursor: isDisabled ? 'not-allowed' : 'pointer',
                      background: isDisabled ? 'var(--bg-inset)' : 'linear-gradient(135deg, var(--accent-mid), var(--accent))',
                      color: isDisabled ? 'var(--text-muted)' : 'var(--text-inverse)',
                      boxShadow: isDisabled ? 'none' : '0 4px 14px rgba(var(--accent-rgb), 0.4)',
                    }}
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sliding reveal panel — structural reference: the profile card's
            avatar panel that slides to expose more on hover. Here it exposes
            the two position-relevant secondary stats instead of a bio. */}
        {secondary.length > 0 && (
          <motion.div
            initial={false}
            animate={{ height: tilt ? 'auto' : 0, opacity: tilt ? 1 : 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow:'hidden' }}
          >
            <div style={{ display:'flex', gap:18, padding:'10px 18px 12px 46px', borderTop:'1px solid rgba(var(--text-primary-rgb), 0.06)' }}>
              {secondary.map(s => (
                <div key={s.label} style={{ display:'flex', flexDirection:'column', gap:1 }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{s.value}</span>
                  <span style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
});

// ─── Roster Slot ─────────────────────────────────────────────────────────────

const RosterSlot = memo(({ label, player }) => (
  <div style={{
    display:'flex', alignItems:'center', gap:10,
    padding:'8px 12px', borderRadius:'var(--radius-md)',
    background: player ? 'var(--bg-raised)' : 'var(--bg-inset)',
    border:'1px solid var(--border-subtle)', marginBottom:4,
  }}>
    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:600, color:'var(--text-muted)', width:28, flexShrink:0, letterSpacing:'0.05em' }}>{label}</span>
    {player ? (
      <>
        <img src={getPlayerImage(player)} alt=""
          style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', background:'var(--bg-inset)', border:'1px solid var(--border-default)', flexShrink:0 }}
          onError={e => e.target.src='https://sleepercdn.com/images/v2/icons/player_default.webp'}
        />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{player.full_name}</div>
          <div style={{ fontSize:10, color:'var(--text-muted)' }}>{player.position} · {player.team}</div>
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-secondary)', flexShrink:0 }}>
          {player.stats?.pts_ppr?.toFixed(1) || '—'}
        </span>
      </>
    ) : (
      <span style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>Empty</span>
    )}
  </div>
));

// ─── Player Modal ─────────────────────────────────────────────────────────────

// Custom recharts tooltip styled to match the app's glass-card language
// rather than recharts' default plain box.
const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      padding:'8px 12px', borderRadius:10, background:'rgba(var(--bg-raised-rgb), 0.92)',
      backdropFilter:'blur(12px)', border:'1px solid var(--border-default)', boxShadow:'0 8px 20px rgba(0,0,0,0.35)',
    }}>
      <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-mono)', marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:700, color:'var(--accent-bright)', fontFamily:'var(--font-mono)' }}>{payload[0].value.toFixed(1)} pts</div>
    </div>
  );
};

const PlayerModal = memo(({ player, onClose, onDraft }) => {
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    setHistoryLoading(true);
    axios.get(`http://localhost:8080/api/players/${player.player_id}/history`)
      .then(res => { if (!cancelled) setHistory(res.data); })
      .catch(() => { if (!cancelled) setHistory(null); })
      .finally(() => { if (!cancelled) setHistoryLoading(false); });
    return () => { cancelled = true; };
  }, [player?.player_id]);

  if (!player) return null;
  const m = POS_META[player.position] || POS_META.K;
  const tierColor = m.color;
  const expandedStats = getExpandedStats(player);
  const playstyle = getPlaystyleSummary(player);

  // Chronological trend: fetched seasons (oldest -> newest) plus the
  // current in-progress season from the player's live stats. Falls back to
  // a flat single-point series (still real data, just no history) rather
  // than fabricating a multi-season trend line when the API has nothing.
  const currentPts = player.stats?.pts_ppr || 0;
  const chartData = (() => {
    const fetched = (history || [])
      .filter(h => h.pts_ppr > 0)
      .sort((a, b) => a.season - b.season)
      .map(h => ({ season: String(h.season), pts: h.pts_ppr }));
    return [...fetched, { season: '2025', pts: currentPts }];
  })();

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:50,
      background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ opacity:0, y: prefersReducedMotion ? 0 : 16, scale: prefersReducedMotion ? 1 : 0.96 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ type:'spring', stiffness:340, damping:30 }}
        className="dz-scrollbar"
        style={{
          width:'100%', maxWidth:460, maxHeight:'88vh', overflowY:'auto',
          background:'rgba(var(--bg-raised-rgb), 0.85)', backdropFilter:'blur(28px) saturate(1.3)', WebkitBackdropFilter:'blur(28px) saturate(1.3)',
          borderRadius:'var(--radius-xl)', boxShadow:'0 32px 72px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          border:'1px solid var(--border-default)',
        }}
      >
        {/* Header */}
        <div style={{ background:`linear-gradient(180deg, ${tierColor}22, transparent)`, padding:'28px 24px 20px', textAlign:'center', position:'relative', borderBottom:'1px solid var(--border-subtle)' }}>
          <button onClick={onClose} style={{
            position:'absolute', top:14, right:14, width:28, height:28,
            borderRadius:'50%', border:'1px solid var(--border-default)',
            background:'var(--bg-raised)', cursor:'pointer', fontSize:12,
            color:'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center',
          }}>✕</button>
          <img src={getPlayerImage(player)} alt={player.full_name}
            style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:`3px solid ${tierColor}`, background:'var(--bg-inset)', margin:'0 auto 12px', boxShadow:`0 0 24px ${tierColor}44` }}
            onError={e => e.target.src='https://sleepercdn.com/images/v2/icons/player_default.webp'}
          />
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text-primary)', marginBottom:6 }}>{player.full_name}</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <PosBadge pos={player.position} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-secondary)' }}>{player.team}</span>
          </div>
        </div>

        <div style={{ padding:'18px 22px 22px', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Headline PPR + expanded position stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[{ label:'PPR Pts', val:currentPts.toFixed(1), accent:true }, ...expandedStats].map((s,i) => (
              <div key={i} style={{
                textAlign:'center', padding:'10px 4px',
                background: i===0 ? `${tierColor}1a` : 'var(--bg-inset)',
                borderRadius:'var(--radius-md)',
                border:`1px solid ${i===0 ? tierColor+'40' : 'var(--border-subtle)'}`,
              }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:i===0?17:15, fontWeight:600, color:i===0?tierColor:'var(--text-primary)' }}>{s.val}</div>
                <div style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Playstyle summary */}
          <div style={{
            padding:'12px 14px', borderRadius:'var(--radius-md)', background:'rgba(var(--bg-surface-rgb), 0.5)',
            border:'1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'var(--font-mono)', marginBottom:6 }}>Playstyle</div>
            <p style={{ fontSize:12, lineHeight:1.6, color:'var(--text-secondary)' }}>{playstyle}</p>
          </div>

          {/* Season trend chart */}
          <div style={{
            padding:'14px 14px 6px', borderRadius:'var(--radius-md)', background:'rgba(var(--bg-surface-rgb), 0.5)',
            border:'1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'var(--font-mono)', marginBottom:8 }}>PPR Points by Season</div>
            {historyLoading ? (
              <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div className="dz-dot-pulse"><span/><span/><span/></div>
              </div>
            ) : (
              <div style={{ width:'100%', height:140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top:6, right:8, bottom:0, left:-20 }}>
                    <defs>
                      <linearGradient id="ppr-trend-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tierColor} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={tierColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="season" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={{ stroke:'var(--border-default)' }} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<TrendTooltip />} />
                    <Area type="monotone" dataKey="pts" stroke={tierColor} strokeWidth={2} fill="url(#ppr-trend-fill)" dot={{ r:3, fill:tierColor, strokeWidth:0 }} activeDot={{ r:5 }} isAnimationActive={!prefersReducedMotion} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <button onClick={() => { onDraft(player); onClose(); }}
            style={{ ...S.btnPrimary, width:'100%', padding:'12px', fontSize:13, justifyContent:'center', borderRadius:'var(--radius-md)' }}>
            Draft {player.full_name.split(' ').slice(-1)[0].toUpperCase()}
          </button>
        </div>
      </motion.div>
    </div>
  );
});

// ─── AI Chat Panel ────────────────────────────────────────────────────────────

const findMentionedPlayer = (text, pool) => {
  if (!text || !pool?.length) return null;
  const lower = text.toLowerCase();
  let best = null;
  for (const p of pool) {
    if (lower.includes(p.full_name.toLowerCase())) {
      if (!best || p.full_name.length > best.full_name.length) best = p;
    }
  }
  return best;
};

const ScoutAvatar = memo(({ thinking, pulseInsight, scale = 1 }) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div style={{ position:'relative', width:24, height:24, flexShrink:0, transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin:'center' }}>
      {!prefersReducedMotion && (
        <motion.div
          animate={{ scale:[1, 1.9, 1], opacity:[0.5, 0, 0.5] }}
          transition={{ repeat:Infinity, duration:3, ease:'easeInOut' }}
          style={{ position:'absolute', inset:0, borderRadius:'50%', background:'var(--accent)', pointerEvents:'none' }}
        />
      )}
      {thinking && (
        <motion.div
          animate={prefersReducedMotion ? {} : { rotate:360 }}
          transition={{ repeat:Infinity, duration:1.4, ease:'linear' }}
          style={{
            position:'absolute', inset:-4, borderRadius:'50%',
            background:'conic-gradient(from 0deg, #3FCB6E, #7EC8C8, #FFD166, #3FCB6E)',
            WebkitMask:'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            mask:'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }}
        />
      )}
      {pulseInsight && !thinking && !prefersReducedMotion && (
        <motion.div
          initial={{ opacity:0.7, scale:1 }}
          animate={{ opacity:[0.7,0,0.7,0], scale:[1,1.5,1,1.5] }}
          transition={{ duration:1.4, times:[0,0.5,0.5,1], repeat:1 }}
          style={{ position:'absolute', inset:-6, borderRadius:'50%', background:'var(--accent-bright)', filter:'blur(5px)', pointerEvents:'none' }}
        />
      )}
      <motion.div
        animate={prefersReducedMotion ? {} : { scale:[1, 1.12, 1] }}
        transition={{ repeat:Infinity, duration:2.2, ease:'easeInOut' }}
        style={{
          position:'absolute', inset:0, borderRadius:'50%',
          background:'linear-gradient(135deg, var(--accent-mid), var(--accent))',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 8px rgba(var(--accent-rgb), 0.35)',
        }}
      >
        <Sparkles size={12} color="var(--text-inverse)" />
      </motion.div>
    </div>
  );
});

const SuggestionCard = memo(({ player, isMyTurn, onDraft }) => (
  <motion.div
    initial={{ opacity:0, height:0, scale:0.95 }}
    animate={{ opacity:1, height:'auto', scale:1 }}
    transition={{ type:'spring', stiffness:400, damping:28 }}
    style={{
      marginTop:6, marginLeft:28, display:'flex', alignItems:'center', gap:8,
      padding:'9px 11px', borderRadius:12, maxWidth:'85%',
      background:'linear-gradient(135deg, rgba(var(--bg-surface-rgb), 0.65), rgba(var(--accent-rgb), 0.12))',
      backdropFilter:'blur(20px) saturate(1.4)', WebkitBackdropFilter:'blur(20px) saturate(1.4)',
      border:'1px solid rgba(var(--text-primary-rgb), 0.1)',
      boxShadow:'0 8px 24px rgba(var(--accent-rgb), 0.14), inset 0 1px 0 rgba(var(--text-inverse-rgb), 0.4)',
    }}
  >
    <img src={getPlayerImage(player)} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover', background:'var(--bg-inset)', flexShrink:0, border:'1px solid rgba(255,255,255,0.6)' }}
      onError={e => e.target.src='https://sleepercdn.com/images/v2/icons/player_default.webp'} />
    <span style={{ flex:1, fontSize:11, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
      {player.full_name}
    </span>
    <motion.button
      whileTap={{ scale:0.92 }}
      whileHover={isMyTurn ? { scale:1.04 } : {}}
      onClick={() => isMyTurn && onDraft(player)}
      disabled={!isMyTurn}
      style={{ ...(isMyTurn ? S.btnPrimary : S.btnDisabled), padding:'5px 11px', fontSize:9 }}
    >
      {isMyTurn ? 'Draft' : 'Not your turn'}
    </motion.button>
  </motion.div>
));

// Categorized scout prompts — structural reference: rafa-porto's
// ai-assistant-interface Learn/Code/Write command grid, adapted to
// fantasy-relevant categories that expand into real, sendable prompts.
const SCOUT_CATEGORIES = {
  pick:  { label:'Best Pick', icon: Target, prompts: [
    'Who should I pick right now?',
    'Give me your top pick for this round.',
    'Who has the best value on the board?',
  ] },
  needs: { label:'Team Needs', icon: Users, prompts: [
    'What position do I need most?',
    'Grade my roster so far.',
    'What should I prioritize next round?',
  ] },
  value: { label:'Sleepers', icon: Gem, prompts: [
    'Best value sleeper on the board?',
    'Any breakout candidates left?',
    'Who is being overlooked right now?',
  ] },
};

const AIChatPanel = memo(({ roster, allPlayers, round, turn, onDraft, isMyTurn, onNewInsight }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [justReplied, setJustReplied] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const bottomRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const msg = text.trim();
    setInput('');
    setMessages(p => [...p, { role:'user', text:msg }]);
    setLoading(true);

    const rosterSummary = ['QB','RB1','RB2','WR1','WR2','TE','FLEX','DST','K']
      .map(k => `${k}: ${roster[k]?.full_name || 'Empty'}`).join(', ');
    const bench = roster.BENCH.map(p => p.full_name).join(', ') || 'None';
    const topAvail = allPlayers.slice(0,20).map(p => `${p.full_name} (${p.position}, ${p.stats?.pts_ppr?.toFixed(1)||0} pts)`).join(', ');

    try {
      const res = await axios.post('http://localhost:8080/api/ai/chat', {
        message:msg, context:{ round, turn, roster:rosterSummary, bench, topAvailable:topAvail }
      });
      const reply = res.data.reply || 'No response.';
      const suggestedPlayer = findMentionedPlayer(reply, allPlayers);
      setMessages(p => [...p, { role:'assistant', text:reply, suggestedPlayer }]);
      setJustReplied(true);
      onNewInsight?.();
      setTimeout(() => setJustReplied(false), 1400);
    } catch {
      setMessages(p => [...p, { role:'assistant', text:'Scout offline — check your connection.' }]);
    }
    setLoading(false);
  }, [loading, roster, allPlayers, round, turn, onNewInsight]);

  return (
    <div style={{
      display:'flex', flexDirection:'column', height:'100%', position:'relative', overflow:'hidden',
      background:'var(--bg-inset)', borderRadius:22, border:'1px solid var(--border-default)',
      boxShadow:'0 24px 48px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      {/* Ambient glows are confined entirely inside this overflow:hidden
          shell (unlike the old accent-tinted outer box-shadow, which bled
          past the panel edge into the gap above it). */}
      <motion.div
        animate={prefersReducedMotion ? {} : { x:[0,30,-10,0], y:[0,-20,10,0] }}
        transition={{ repeat:Infinity, duration:14, ease:'easeInOut' }}
        style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'var(--accent-bright)', opacity:0.16, filter:'blur(60px)', pointerEvents:'none' }}
      />
      <motion.div
        animate={prefersReducedMotion ? {} : { x:[0,-25,15,0], y:[0,20,-15,0] }}
        transition={{ repeat:Infinity, duration:16, ease:'easeInOut' }}
        style={{ position:'absolute', top:180, left:-70, width:200, height:200, borderRadius:'50%', background:'var(--info)', opacity:0.1, filter:'blur(60px)', pointerEvents:'none' }}
      />
      <motion.div
        animate={prefersReducedMotion ? {} : { x:[0,20,-20,0], y:[0,-15,20,0] }}
        transition={{ repeat:Infinity, duration:12, ease:'easeInOut' }}
        style={{ position:'absolute', bottom:-50, right:-30, width:180, height:180, borderRadius:'50%', background:'var(--cpu-accent)', opacity:0.1, filter:'blur(60px)', pointerEvents:'none' }}
      />

      <div style={{
        flexShrink:0, display:'flex', alignItems:'center', gap:10, padding:'16px 18px',
        borderBottom:'1px solid var(--border-default)', background: 'rgba(var(--bg-surface-rgb), 0.55)',
        backdropFilter:'blur(24px) saturate(1.3)', WebkitBackdropFilter:'blur(24px) saturate(1.3)',
        position:'relative', zIndex:1, overflow:'hidden',
      }}>
        <ScoutAvatar thinking={loading} pulseInsight={justReplied} />
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', letterSpacing:'0.02em' }}>AI Scout</span>
        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, fontSize:9, color:'var(--text-muted)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.04em' }}>
          <span className="dz-blink" style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent-mid)' }} />
          Live
        </span>
      </div>

      <div className="dz-scrollbar" style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12, position:'relative', zIndex:1 }}>
        <AnimatePresence initial={false}>
          {messages.map((m,i) => {
            const stillAvailable = m.suggestedPlayer && allPlayers.some(p => p.player_id === m.suggestedPlayer.player_id);
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity:0, y:10, scale:0.97 }}
                animate={{ opacity:1, y:0, scale:1 }}
                transition={{ type:'spring', stiffness:500, damping:32 }}
                style={{ display:'flex', flexDirection:'column', alignItems:m.role==='user'?'flex-end':'flex-start' }}
              >
                <div style={{ display:'flex', gap:6, alignItems:'flex-end', maxWidth:'88%' }}>
                  {m.role==='assistant' && <ScoutAvatar thinking={false} />}
                  <div style={{
                    padding:'9px 12px', fontSize:12, lineHeight:1.6,
                    borderRadius: m.role==='user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    background: m.role==='user' ? 'linear-gradient(135deg, var(--accent-mid), var(--accent))' : 'rgba(var(--bg-surface-rgb), 0.45)',
                    backdropFilter: m.role==='user' ? 'none' : 'blur(20px) saturate(1.5)',
                    WebkitBackdropFilter: m.role==='user' ? 'none' : 'blur(20px) saturate(1.5)',
                    color: m.role==='user' ? 'var(--text-inverse)' : 'var(--text-primary)',
                    border: m.role==='user' ? 'none' : '1px solid rgba(255,255,255,0.55)',
                    boxShadow: m.role==='user' ? '0 4px 14px rgba(var(--accent-rgb), 0.3)' : '0 6px 18px rgba(30,25,15,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
                  }}>{m.text}</div>
                </div>
                {stillAvailable && (
                  <SuggestionCard player={m.suggestedPlayer} isMyTurn={isMyTurn} onDraft={onDraft} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} style={{ display:'flex', gap:6, alignItems:'center' }}>
            <ScoutAvatar thinking />
            <div style={{
              padding:'9px 14px', background: 'rgba(var(--bg-surface-rgb), 0.45)', backdropFilter:'blur(20px) saturate(1.5)', WebkitBackdropFilter:'blur(20px) saturate(1.5)',
              borderRadius:'12px 12px 12px 3px', border:'1px solid rgba(255,255,255,0.55)',
              boxShadow:'0 6px 18px rgba(30,25,15,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
              display:'flex', alignItems:'center', gap:6,
            }}>
              <div className="dz-dot-pulse"><span/><span/><span/></div>
              <span style={{ fontSize:10, color:'var(--text-secondary)' }}>Scout is thinking…</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 0 && (
        <div style={{ padding:'2px 16px 16px', display:'flex', flexDirection:'column', gap:14, position:'relative', zIndex:1 }}>
          {/* Welcome hero — structural reference: ai-assistant-interface's
              centered animated logo + headline, using the same breathing
              ScoutAvatar scaled up rather than a separate mark. */}
          <motion.div
            initial={{ opacity:0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.3 }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:12, padding:'8px 6px 2px' }}
          >
            <ScoutAvatar thinking={false} scale={2.2} />
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>Ready to scout</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5, maxWidth:220 }}>Ask about any player, or tap a category for tailored advice.</div>
            </div>
          </motion.div>

          {/* Category grid — structural reference: the Learn/Code/Write
              command buttons, remapped to fantasy-relevant categories. */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
            {Object.entries(SCOUT_CATEGORIES).map(([key, cat], ci) => {
              const Icon = cat.icon;
              const active = activeCategory === key;
              return (
                <motion.button
                  key={key}
                  initial={{ opacity:0, y: prefersReducedMotion ? 0 : 10, scale: prefersReducedMotion ? 1 : 0.96 }}
                  animate={{ opacity:1, y:0, scale:1 }}
                  transition={{ type:'spring', stiffness:380, damping:26, delay: prefersReducedMotion ? 0 : ci*0.07 }}
                  whileHover={{ scale:1.04, y:-1 }}
                  whileTap={{ scale:0.95 }}
                  onClick={() => setActiveCategory(active ? null : key)}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'12px 6px',
                    borderRadius:14, cursor:'pointer', fontFamily:'var(--font-body)',
                    background: active ? 'rgba(var(--accent-rgb), 0.14)' : 'rgba(var(--bg-surface-rgb), 0.4)',
                    backdropFilter:'blur(16px) saturate(1.4)', WebkitBackdropFilter:'blur(16px) saturate(1.4)',
                    border: `1px solid ${active ? 'rgba(var(--accent-rgb), 0.4)' : 'rgba(255,255,255,0.55)'}`,
                    boxShadow: active ? '0 8px 20px rgba(var(--accent-rgb), 0.18)' : 'inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}
                >
                  <Icon size={15} style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }} />
                  <span style={{ fontSize:10, fontWeight:600, color: active ? 'var(--accent-text)' : 'var(--text-secondary)' }}>{cat.label}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {activeCategory && (
              <motion.div
                initial={{ opacity:0, height:0 }}
                animate={{ opacity:1, height:'auto' }}
                exit={{ opacity:0, height:0 }}
                transition={{ duration:0.32, ease:[0.16,1,0.3,1] }}
                style={{ overflow:'hidden' }}
              >
                <div style={{ display:'flex', flexDirection:'column', gap:6, padding:'2px 2px 0' }}>
                  {SCOUT_CATEGORIES[activeCategory].prompts.map((p, pi) => (
                    <motion.button
                      key={p}
                      initial={{ opacity:0, x: prefersReducedMotion ? 0 : -6 }}
                      animate={{ opacity:1, x:0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : pi*0.04 }}
                      whileHover={{ x:2, backgroundColor:'rgba(var(--accent-rgb), 0.1)', borderColor:'rgba(var(--accent-rgb), 0.35)' }}
                      whileTap={{ scale:0.97 }}
                      onClick={() => { send(p); setActiveCategory(null); }}
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, textAlign:'left',
                        padding:'9px 12px', borderRadius:11, cursor:'pointer', fontFamily:'var(--font-body)',
                        background:'rgba(var(--bg-surface-rgb), 0.35)', border:'1px solid rgba(255,255,255,0.45)',
                        fontSize:11, color:'var(--text-secondary)', fontWeight:500,
                      }}
                    >
                      <span>{p}</span>
                      <ChevronRight size={12} style={{ color:'var(--accent)', flexShrink:0 }} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Input card — structural reference: ai-assistant-interface's boxed
          input container, floating as its own surface rather than a flush
          bottom bar. */}
      <div style={{ padding:'10px 14px 14px', position:'relative', zIndex:1 }}>
        <div style={{
          display:'flex', alignItems:'center', gap:8, padding:8, borderRadius:16,
          background:'rgba(var(--bg-surface-rgb), 0.55)', backdropFilter:'blur(20px) saturate(1.5)', WebkitBackdropFilter:'blur(20px) saturate(1.5)',
          border:'1px solid rgba(255,255,255,0.55)', boxShadow:'0 10px 26px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && send(input)}
            placeholder="Ask about a player or pick..."
            style={{
              ...S.input, flex:1, background:'transparent', border:'none', boxShadow:'none',
            }}
          />
          <motion.button
            whileHover={loading||!input.trim() ? {} : { scale:1.04 }}
            whileTap={loading||!input.trim() ? {} : { scale:0.94 }}
            onClick={() => send(input)} disabled={loading||!input.trim()}
            style={loading||!input.trim() ? S.btnDisabled : S.btnPrimary}>
            Ask
          </motion.button>
        </div>
      </div>
    </div>
  );
});

// ─── Roster Panel ─────────────────────────────────────────────────────────────

const RosterPanel = ({ roster, label, isActive }) => {
  const slots = [['QB','QB'],['RB','RB1'],['RB','RB2'],['WR','WR1'],['WR','WR2'],['TE','TE'],['FLEX','FLEX'],['DEF','DST'],['K','K']];
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {isActive && <div className="dz-blink" style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)' }} />}
          <span style={{ fontSize:13, fontWeight:600, color: isActive?'var(--accent-text)':'var(--text-secondary)', letterSpacing:'0.03em' }}>{label}</span>
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)' }}>{countPlayers(roster)}/16</span>
      </div>
      {slots.map(([lbl,key]) => <RosterSlot key={key} label={lbl} player={roster[key]} />)}
      {roster.BENCH.length > 0 && (
        <>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase', padding:'8px 4px 4px', fontFamily:'var(--font-mono)' }}>Bench</div>
          {roster.BENCH.map((p,i) => <RosterSlot key={i} label="BN" player={p} />)}
        </>
      )}
    </div>
  );
};

// ─── Draft Recap ──────────────────────────────────────────────────────────────

const DraftRecap = ({ rosters, onRestart }) => {
  const s1 = calcScore(rosters.user1), s2 = calcScore(rosters.user2);
  const winner = parseFloat(s1) >= parseFloat(s2) ? 'user1' : 'user2';
  const slots = [['QB','QB'],['RB','RB1'],['RB','RB2'],['WR','WR1'],['WR','WR2'],['TE','TE'],['FLEX','FLEX'],['DEF','DST'],['K','K']];

  const [recap, setRecap] = useState(null);
  const [recapLoading, setRecapLoading] = useState(true);

  useEffect(() => {
    axios.post('http://localhost:8080/api/ai/recap', { rosters, scores: { score1: s1, score2: s2 } })
      .then(res => setRecap(res.data))
      .catch(() => setRecap({ grade: '—', summary: "Scout couldn't grade this draft right now." }))
      .finally(() => setRecapLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'var(--font-body)' }}>
      <div style={{ width:'100%', maxWidth:600 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:36, color:'var(--text-primary)', marginBottom:4, fontStyle:'italic' }}>Draft Complete</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Season projections · 2025 stats</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:16, marginBottom:20, background:'var(--bg-raised)', borderRadius:'var(--radius-xl)', padding:'24px 32px', border:'1px solid var(--border-default)', boxShadow:'var(--shadow-md)' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>Team Human</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:48, fontWeight:600, color:winner==='user1'?'var(--accent)':'var(--text-muted)' }}>{s1}</div>
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--border-strong)', fontStyle:'italic' }}>vs</div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>Team CPU</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:48, fontWeight:600, color:winner==='user2'?'var(--cpu-accent)':'var(--text-muted)' }}>{s2}</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.4 }}
          style={{
            display:'flex', alignItems:'flex-start', gap:12, marginBottom:16, padding:'16px 20px', borderRadius:'var(--radius-xl)',
            background:'rgba(var(--bg-surface-rgb), 0.6)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
            border:'1px solid var(--border-default)', boxShadow:'var(--shadow-sm)',
          }}
        >
          <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', marginTop:2 }}>
            <Sparkles size={12} color="var(--text-inverse)" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <span style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Scout's grade</span>
              {!recapLoading && recap && (
                <span style={{ fontFamily:'var(--font-mono)', fontSize:16, fontWeight:700, color:'var(--accent)' }}>{recap.grade}</span>
              )}
            </div>
            {recapLoading ? (
              <div className="dz-dot-pulse"><span/><span/><span/></div>
            ) : (
              <p style={{ fontSize:12, lineHeight:1.6, color:'var(--text-secondary)' }}>{recap?.summary}</p>
            )}
          </div>
        </motion.div>

        <div style={{ background:'var(--bg-raised)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border-default)', overflow:'hidden', boxShadow:'var(--shadow-sm)', marginBottom:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 48px 1fr', padding:'8px 20px', background:'var(--bg-inset)', borderBottom:'1px solid var(--border-subtle)' }}>
            {['Human','','CPU'].map((h,i)=>(
              <span key={i} style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'var(--font-mono)', textAlign:i===2?'right':'left' }}>{h}</span>
            ))}
          </div>
          <div className="dz-scrollbar" style={{ maxHeight:420, overflowY:'auto' }}>
            {slots.map(([lbl,key]) => {
              const p1=rosters.user1[key], p2=rosters.user2[key];
              return (
                <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 48px 1fr', alignItems:'center', padding:'10px 20px', borderBottom:'1px solid var(--border-subtle)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-inset)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <img src={getPlayerImage(p1)} style={{ width:28,height:28,borderRadius:'50%',objectFit:'cover',background:'var(--bg-inset)',border:'1px solid var(--border-subtle)' }} alt="" onError={e=>e.target.src='https://sleepercdn.com/images/v2/icons/player_default.webp'} />
                    <div>
                      <div style={{ fontSize:12,fontWeight:500,color:'var(--text-primary)' }}>{p1?.full_name||'—'}</div>
                      <div style={{ fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)' }}>{p1?.stats?.pts_ppr?.toFixed(1)||0} pts</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <span style={{ fontSize:10,fontWeight:600,color:'var(--text-muted)',background:'var(--bg-inset)',padding:'2px 6px',borderRadius:'var(--radius-sm)',fontFamily:'var(--font-mono)',border:'1px solid var(--border-subtle)' }}>{lbl}</span>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:8,justifyContent:'flex-end',flexDirection:'row-reverse' }}>
                    <img src={getPlayerImage(p2)} style={{ width:28,height:28,borderRadius:'50%',objectFit:'cover',background:'var(--bg-inset)',border:'1px solid var(--border-subtle)' }} alt="" onError={e=>e.target.src='https://sleepercdn.com/images/v2/icons/player_default.webp'} />
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:12,fontWeight:500,color:'var(--text-primary)' }}>{p2?.full_name||'—'}</div>
                      <div style={{ fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)' }}>{p2?.stats?.pts_ppr?.toFixed(1)||0} pts</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={onRestart} style={{ ...S.btnPrimary, width:'100%', padding:'14px', fontSize:13, justifyContent:'center', borderRadius:'var(--radius-lg)' }}>
          Start New Draft
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CATEGORIES   = ['ALL','QB','RB','WR','TE','DEF','K'];
const SIDEBAR_TABS = ['AI Scout','My Roster','CPU Roster'];

const DraftSimulator = ({ user, onLogout }) => {
  const [draftId, setDraftId]         = useState(null);
  const [allPlayers, setAllPlayers]   = useState([]);
  const [displayPlayers, setDisplay]  = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterPos, setFilterPos]     = useState('ALL');
  const [gameMode, setGameMode]       = useState('PvAI');
  const [selectedPlayer, setSelected] = useState(null);
  const [rosters, setRosters]         = useState({ user1:getEmptyRoster(), user2:getEmptyRoster() });
  const [turn, setTurn]               = useState(1);
  const [round, setRound]             = useState(1);
  const [loading, setLoading]         = useState(true);
  const [aiLoading, setAiLoading]     = useState(false);
  const [isDraftComplete, setDone]    = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [sidebarTab, setSidebarTab]   = useState(0);
  const [pickHistory, setPickHistory] = useState([]);
  const [hasUnseenInsight, setHasUnseenInsight] = useState(false);
  const [flyingPicks, setFlyingPicks] = useState([]);
  const hasInit = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const handleNewInsight = useCallback(() => {
    if (sidebarTab !== 0) setHasUnseenInsight(true);
  }, [sidebarTab]);

  const selectSidebarTab = (i) => {
    setSidebarTab(i);
    if (i === 0) setHasUnseenInsight(false);
  };

  // Draft confirmation: a small ghost of the player card flies from where it
  // was clicked toward the roster/AI panel and fades out, so drafting reads
  // as "this went into my team" rather than an instant table mutation.
  const handleDraftStart = useCallback((player, rect) => {
    const id = `${player.player_id}-${Date.now()}`;
    setFlyingPicks(fp => [...fp, { id, player, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
    setTimeout(() => setFlyingPicks(fp => fp.filter(f => f.id !== id)), 750);
  }, []);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    (async () => {
      try {
        setLoading(true);
        const pr = await axios.get('http://localhost:8080/api/players/fetch');
        setAllPlayers(pr.data); setDisplay(pr.data); setLoading(false);
        const dr = await axios.post('http://localhost:8080/api/drafts', { gameMode });
        setDraftId(dr.data.draftId);
      } catch { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setDisplay(allPlayers.filter(p =>
      (filterPos==='ALL' || p.position===filterPos) &&
      (p.full_name.toLowerCase().includes(term) || p.team?.toLowerCase().includes(term))
    ));
  }, [searchTerm, filterPos, allPlayers]);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(''), 3000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  const finishDraft = async (fr) => {
    if (!draftId) return;
    const s1=calcScore(fr.user1), s2=calcScore(fr.user2);
    const winner = parseFloat(s1)>=parseFloat(s2) ? 'User 1' : 'User 2';
    try { await axios.put(`http://localhost:8080/api/drafts/${draftId}/finish`, { winner, score1:parseFloat(s1), score2:parseFloat(s2) }); } catch {}
  };

  const draftPlayer = useCallback(async (player, reason) => {
    if (!player) return false;
    const cu = `user${turn}`;
    const cr = { ...rosters[cu], BENCH:[...rosters[cu].BENCH] };
    const pos = player.position;
    let slot = null;

    if (pos==='QB' && !cr.QB)          slot='QB';
    else if (pos==='RB') { if(!cr.RB1) slot='RB1'; else if(!cr.RB2) slot='RB2'; else if(!cr.FLEX) slot='FLEX'; }
    else if (pos==='WR') { if(!cr.WR1) slot='WR1'; else if(!cr.WR2) slot='WR2'; else if(!cr.FLEX) slot='FLEX'; }
    else if (pos==='TE') { if(!cr.TE)  slot='TE';  else if(!cr.FLEX) slot='FLEX'; }
    else if (pos==='DEF' && !cr.DST)   slot='DST';
    else if (pos==='K'   && !cr.K)     slot='K';

    if (!slot) {
      if (cr.BENCH.length >= 7) { if(turn===1) setErrorMsg(`${pos} slots and bench are full.`); return false; }
      slot = 'BENCH';
    }

    if (slot==='BENCH') cr.BENCH.push(player); else cr[slot]=player;
    const ur = { ...rosters, [cu]:cr };
    setRosters(ur);
    setPickHistory(h => [...h, { pick:h.length+1, round, turn, player, slot, reason }]);
    if (draftId) axios.post(`http://localhost:8080/api/drafts/${draftId}/pick`, { player, user:cu, round, turn, slot }).catch(()=>{});

    const p1c=countPlayers(ur.user1), p2c=countPlayers(ur.user2);
    if (p1c>=16 && p2c>=16) { setDone(true); await finishDraft(ur); return true; }

    const newPool = allPlayers.filter(p => p.player_id!==player.player_id);
    setAllPlayers(newPool);
    if (turn===2) { setTurn(1); setRound(r=>r+1); } else setTurn(2);
    return true;
  }, [turn, rosters, allPlayers, round, draftId]);

  useEffect(() => {
    if (isDraftComplete || !(gameMode==='PvAI' && turn===2)) return;
    const go = async () => {
      setAiLoading(true);
      const cr = rosters.user2;
      let pool = allPlayers;
      if (cr.BENCH.length >= 7) {
        const need = [];
        if(!cr.QB) need.push('QB');
        if(!cr.RB1||!cr.RB2) need.push('RB');
        if(!cr.WR1||!cr.WR2) need.push('WR');
        if(!cr.TE) need.push('TE');
        if(!cr.DST) need.push('DEF');
        if(!cr.K) need.push('K');
        pool = allPlayers.filter(p=>need.includes(p.position));
        if(!pool.length) pool = allPlayers;
      }
      let pick = null;
      let reason = null;
      try {
        const res = await axios.post('http://localhost:8080/api/ai/suggest', { roster:rosters.user2, availablePlayers:pool.slice(0,15), round }, { timeout:8000 });
        if (res.data.player) pick = pool.find(p=>p.full_name.toLowerCase().includes(res.data.player.toLowerCase()));
        reason = res.data.reason || null;
      } catch {}
      if (!pick) pick = pool.find(p=>['QB','RB','WR','TE'].includes(p.position)) || pool[0];
      if (pick) draftPlayer(pick, reason);
      setAiLoading(false);
    };
    const t = setTimeout(go, 700);
    return () => clearTimeout(t);
  }, [turn, gameMode, round, isDraftComplete]);

  const restart = () => {
    setRosters({ user1:getEmptyRoster(), user2:getEmptyRoster() });
    setTurn(1); setRound(1); setErrorMsg(''); setDone(false); setPickHistory([]); setSidebarTab(0); setHasUnseenInsight(false);
    hasInit.current = false; setLoading(true);
    axios.get('http://localhost:8080/api/players/fetch').then(r => { setAllPlayers(r.data); setDisplay(r.data); setLoading(false); });
  };

  if (isDraftComplete) return (<><style>{THEME}</style><DraftRecap rosters={rosters} onRestart={restart} /></>);

  if (loading) return (
    <>
      <style>{THEME}</style>
      <div style={{ height:'100vh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-body)' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:36, color:'var(--text-primary)', marginBottom:8, fontStyle:'italic' }}>
            Draft<span style={{ color:'var(--accent)' }}>Zone</span>
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.08em' }}>Loading player pool…</div>
        </div>
      </div>
    </>
  );

  const isMyTurn = turn === 1;
  const visiblePlayers = displayPlayers.slice(0, 120);
  const maxPts = visiblePlayers.reduce((m, p) => Math.max(m, p.stats?.pts_ppr || 0), 0);

  return (
    <>
      <style>{THEME}</style>
      <div style={{ height:'100vh', background:'var(--bg-base)', color:'var(--text-primary)', fontFamily:'var(--font-body)', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

        {/* ── Depth layer 0: ambient background, sits behind every panel ──── */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
          <motion.div
            animate={prefersReducedMotion ? {} : { x:[0,60,-20,0], y:[0,-40,20,0] }}
            transition={{ repeat:Infinity, duration:22, ease:'easeInOut' }}
            style={{ position:'absolute', top:'-10%', left:'8%', width:480, height:480, borderRadius:'50%', background:'var(--accent)', opacity:0.12, filter:'blur(120px)' }}
          />
          <motion.div
            animate={prefersReducedMotion ? {} : { x:[0,-50,30,0], y:[0,30,-25,0] }}
            transition={{ repeat:Infinity, duration:26, ease:'easeInOut' }}
            style={{ position:'absolute', bottom:'-15%', right:'10%', width:520, height:520, borderRadius:'50%', background:'var(--cpu-accent)', opacity:0.1, filter:'blur(130px)' }}
          />
        </div>

        {/* Toast */}
        {errorMsg && (
          <div className="dz-fade" style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', zIndex:100, background:'var(--warn-light)', border:'1px solid var(--warn)', color:'var(--warn)', fontSize:12, fontWeight:500, padding:'8px 16px', borderRadius:'var(--radius-pill)', boxShadow:'var(--shadow-md)', whiteSpace:'nowrap' }}>
            {errorMsg}
          </div>
        )}

        {/* Flying draft confirmations — ghost of the drafted card travels toward the roster */}
        <div style={{ position:'fixed', inset:0, zIndex:150, pointerEvents:'none' }}>
          <AnimatePresence>
            {flyingPicks.map(fp => (
              <motion.div
                key={fp.id}
                style={{
                  position:'fixed', left:fp.x, top:fp.y, marginLeft:-70,
                  display:'flex', alignItems:'center', gap:8, padding:'7px 14px 7px 7px', borderRadius:999,
                  background:'rgba(var(--bg-surface-rgb), 0.92)', backdropFilter:'blur(20px)',
                  border:'1px solid rgba(255,255,255,0.25)', boxShadow:'0 16px 40px rgba(0,0,0,0.3)',
                }}
                initial={{ opacity:1, scale:1, x:0, y:0 }}
                animate={{
                  opacity:[1,1,0], scale:[1,1,0.35],
                  x: typeof window !== 'undefined' ? window.innerWidth - fp.x - 60 : 0,
                  y: 70 - fp.y,
                }}
                transition={{ duration:0.7, times:[0,0.15,1], ease:[0.16,1,0.3,1] }}
              >
                <img src={getPlayerImage(fp.player)} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover' }} />
                <span style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{fp.player.full_name}</span>
                <Check size={13} strokeWidth={3} style={{ color:'var(--accent)', flexShrink:0 }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Header ──────────────────────────────────────────────── */}
        <header style={{
          flexShrink:0, background:'transparent',
          padding:'18px 28px 8px', display:'flex', alignItems:'center', gap:20,
          position:'relative', zIndex:20,
        }}>
          <Link to="/" style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            width:30, height:30, borderRadius:'50%', flexShrink:0,
            border:'1px solid var(--border-default)', color:'var(--text-secondary)',
            textDecoration:'none', fontSize:14,
          }} title="Exit draft">←</Link>

          <div style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--text-primary)', flexShrink:0, letterSpacing:'-0.01em' }}>
            Draft<span style={{ color:'var(--accent)', fontStyle:'italic' }}>Zone</span>
          </div>

          <div style={{ width:1, height:20, background:'var(--border-default)' }} />

          <nav style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:16 }}>
            {[['Search','/player-search'],['Odds','/odds'],['Bets','/my-bets'],...(user?.role==='admin'?[['Admin','/admin']]:[])].map(([label,to]) => (
              <Link key={to} to={to} style={{
                fontSize:11, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase',
                color:'var(--text-secondary)', textDecoration:'none', fontFamily:'var(--font-body)',
              }}>{label}</Link>
            ))}
            <button onClick={onLogout} style={{
              fontSize:11, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase',
              color:'var(--text-secondary)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)',
            }}>Log out</button>
            <ThemeToggle size={28} />
          </nav>

          <div style={{ display:'flex', background:'var(--bg-inset)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', padding:3, gap:2 }}>
            {['PVP','PvAI'].map(m => (
              <button key={m} onClick={()=>setGameMode(m)} style={{
                padding:'5px 16px', borderRadius:'var(--radius-sm)', border:'none',
                fontSize:11, fontWeight:600, letterSpacing:'0.04em', fontFamily:'var(--font-body)', cursor:'pointer',
                background: gameMode===m ? (m==='PVP'?'var(--accent)':'var(--cpu-accent)') : 'transparent',
                color: gameMode===m ? 'var(--text-inverse)' : 'var(--text-muted)',
              }}>{m}</button>
            ))}
          </div>
        </header>

        {/* ── Floating round/pick status pill ────────────────────────── */}
        <DynamicIsland
          expanded={isMyTurn || aiLoading}
          collapsed={
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-inverse)', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
              R{round} · Pick {pickHistory.length+1}
            </span>
          }
        >
          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 16px 7px 13px' }}>
            <motion.span
              animate={prefersReducedMotion ? {} : { scale:[1,1.35,1], opacity:[1,0.55,1] }}
              transition={{ repeat:Infinity, duration:1.3, ease:'easeInOut' }}
              style={{ width:7, height:7, borderRadius:'50%', background: isMyTurn?'var(--accent-bright)':'var(--cpu-accent)', flexShrink:0 }}
            />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-primary)', whiteSpace:'nowrap' }}>
              R{round} · Pick {pickHistory.length+1}
            </span>
            <span style={{ width:1, height:14, background:'rgba(var(--text-primary-rgb), 0.15)', flexShrink:0 }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.03em', whiteSpace:'nowrap', color: isMyTurn?'var(--accent-text)':'var(--cpu-text)' }}>
              {isMyTurn ? 'Your pick' : 'CPU picking…'}
            </span>
          </div>
        </DynamicIsland>

        {/* ── Body: two distinct floating panels over the ambient background ── */}
        <div style={{ flex:1, display:'flex', gap:20, overflow:'hidden', padding:'12px 28px 24px', position:'relative', zIndex:1 }}>

          {/* Player Pool — its own elevated glass surface, not full-bleed.
              Depth layer 1: sits above the ambient background blobs, below
              the individual player cards floating on top of it. */}
          <div style={{
            flex:1, display:'flex', flexDirection:'column', overflow:'hidden', borderRadius:24,
            background:'rgba(var(--bg-raised-rgb), 0.55)', backdropFilter:'blur(28px) saturate(1.3)', WebkitBackdropFilter:'blur(28px) saturate(1.3)',
            border:'1px solid var(--border-default)', boxShadow:'0 28px 64px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>

            {/* Search + filters — a lighter glass layer sitting above the panel */}
            <div style={{
              flexShrink:0, padding:'18px 22px 14px',
              display:'flex', flexDirection:'column', gap:12, position:'relative', zIndex:2,
            }}>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:15,height:15,color:'var(--text-muted)',pointerEvents:'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <label htmlFor="draft-player-search" className="sr-only">Search players</label>
                <input id="draft-player-search" type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                  placeholder="Search players…"
                  style={{
                    ...S.input, paddingLeft:38, paddingTop:11, paddingBottom:11, width:'100%', fontSize:13, borderRadius:'var(--radius-lg)',
                    background:'rgba(var(--text-primary-rgb), 0.04)', border:'1px solid rgba(var(--text-primary-rgb), 0.08)',
                  }}
                  onFocus={e=>e.target.style.borderColor='var(--accent)'}
                  onBlur={e=>e.target.style.borderColor='rgba(var(--text-primary-rgb), 0.08)'}
                />
              </div>
              <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
                {CATEGORIES.map(cat => {
                  const m = POS_META[cat];
                  const active = filterPos===cat;
                  return (
                    <motion.button key={cat} onClick={()=>setFilterPos(cat)}
                      whileHover={{ scale:1.05 }}
                      whileTap={{ scale:0.95 }}
                      transition={{ type:'spring', stiffness:400, damping:22 }}
                      style={{
                        padding:'5px 13px', borderRadius:'var(--radius-pill)',
                        fontSize:11, fontWeight:600, letterSpacing:'0.04em',
                        fontFamily:'var(--font-body)', cursor:'pointer',
                        border: active ? `1px solid ${m?.color||'var(--accent)'}66` : '1px solid rgba(var(--text-primary-rgb), 0.08)',
                        background: active ? (m?.bg||'var(--accent-light)') : 'transparent',
                        color: active ? (m?.color||'var(--accent)') : 'var(--text-secondary)',
                      }}>{cat}</motion.button>
                  );
                })}
                <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)' }}>
                  {displayPlayers.length} available
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="dz-scrollbar" style={{ flex:1, overflowY:'auto', padding:'2px 18px 18px' }}>
              <AnimatePresence initial={false}>
                {visiblePlayers.map((p,i)=>(
                  <PlayerRow key={p.player_id} player={p} rank={i+1} maxPts={maxPts} onDraft={draftPlayer} onDraftStart={handleDraftStart} onSelect={setSelected} isDisabled={gameMode==='PvAI'&&turn===2} />
                ))}
              </AnimatePresence>
              {displayPlayers.length===0 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:120, color:'var(--text-muted)', fontSize:13 }}>No players found</div>
              )}
            </div>
          </div>

          {/* Sidebar — floats separately with its own margin, gap, and glow */}
          <div style={{ width:340, flexShrink:0, display:'flex', flexDirection:'column', gap:12 }}>

            {/* Tabs */}
            <div style={{ display:'flex', gap:3, padding:4, flexShrink:0, borderRadius:'var(--radius-lg)', background:'rgba(var(--text-primary-rgb), 0.05)', border:'1px solid rgba(var(--text-primary-rgb), 0.06)' }}>
              {SIDEBAR_TABS.map((tab,i)=>(
                <button key={tab} onClick={()=>selectSidebarTab(i)} style={{
                  position:'relative', flex:1, padding:'8px 4px',
                  fontSize:11, fontWeight:600, letterSpacing:'0.03em',
                  fontFamily:'var(--font-body)', border:'none', cursor:'pointer', background:'transparent',
                  color: sidebarTab===i ? 'var(--text-inverse)' : 'var(--text-muted)',
                  transition:'color 0.2s',
                }}>
                  {sidebarTab===i && (
                    <motion.div layoutId="tab-pill" transition={{ type:'spring', stiffness:500, damping:35 }}
                      style={{ position:'absolute', inset:0, background:'var(--accent)', borderRadius:'var(--radius-sm)', zIndex:0 }}
                    />
                  )}
                  <span style={{ position:'relative', zIndex:1, display:'inline-flex', alignItems:'center', gap:5 }}>
                    {tab}
                    {tab==='AI Scout' && hasUnseenInsight && (
                      <span style={{ width:5, height:5, borderRadius:'50%', background: sidebarTab===i?'var(--text-inverse)':'var(--accent-bright)', flexShrink:0 }} />
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ flex:1, minHeight:0, overflow:'visible', display:'flex', flexDirection:'column', position:'relative' }}>
              {/* AI Scout stays mounted so chat history survives tab switches */}
              <div style={{ flex:1, minHeight:0, display: sidebarTab===0 ? 'flex' : 'none', flexDirection:'column' }}>
                <AIChatPanel roster={rosters.user1} allPlayers={allPlayers} round={round} turn={turn} onDraft={draftPlayer} isMyTurn={isMyTurn} onNewInsight={handleNewInsight} />
              </div>
              {sidebarTab===1 && (
                <div className="dz-scrollbar" style={{
                  flex:1, overflowY:'auto', padding:16, borderRadius:22,
                  background:'rgba(var(--bg-raised-rgb), 0.55)', backdropFilter:'blur(20px) saturate(1.3)', WebkitBackdropFilter:'blur(20px) saturate(1.3)',
                  border:'1px solid var(--border-default)', boxShadow:'0 20px 44px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}>
                  <RosterPanel roster={rosters.user1} label="Team Human" isActive={turn===1} />
                </div>
              )}
              {sidebarTab===2 && (
                <div className="dz-scrollbar" style={{
                  flex:1, overflowY:'auto', padding:16, borderRadius:22,
                  background:'rgba(var(--bg-raised-rgb), 0.55)', backdropFilter:'blur(20px) saturate(1.3)', WebkitBackdropFilter:'blur(20px) saturate(1.3)',
                  border:'1px solid var(--border-default)', boxShadow:'0 20px 44px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}>
                  <RosterPanel roster={rosters.user2} label="Team CPU" isActive={turn===2} />
                </div>
              )}
            </div>

            {/* Pick history */}
            {pickHistory.length > 0 && (
              <div style={{
                flexShrink:0, padding:'14px 16px', borderRadius:20,
                background:'rgba(var(--bg-surface-rgb), 0.55)', backdropFilter:'blur(20px) saturate(1.3)', WebkitBackdropFilter:'blur(20px) saturate(1.3)',
                border:'1px solid var(--border-default)', boxShadow:'0 14px 32px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'var(--font-mono)', marginBottom:8 }}>Recent picks</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {[...pickHistory].reverse().slice(0,3).map((h,i)=>(
                    <div key={i}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11 }}>
                        <span style={{ fontFamily:'var(--font-mono)', color:'var(--text-muted)', width:20, textAlign:'right', flexShrink:0 }}>{h.pick}.</span>
                        <span style={{ fontWeight:600, color:h.turn===1?'var(--accent-text)':'var(--cpu-text)', flexShrink:0, fontFamily:'var(--font-mono)', fontSize:10 }}>
                          {h.turn===1?'HUM':'CPU'}
                        </span>
                        <span style={{ color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{h.player.full_name}</span>
                        <PosBadge pos={h.player.position} />
                      </div>
                      {h.reason && (
                        <div style={{ fontSize:10, color:'var(--text-muted)', fontStyle:'italic', paddingLeft:28, marginTop:2, lineHeight:1.4 }}>
                          "{h.reason}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedPlayer && <PlayerModal player={selectedPlayer} onClose={()=>setSelected(null)} onDraft={draftPlayer} />}

        {/* Floating "new insight" pill — collapsed AI Scout affordance while on another tab */}
        {hasUnseenInsight && (
          <DynamicIsland expanded className="bottom-6 right-6">
            <button
              onClick={() => selectSidebarTab(0)}
              style={{
                display:'flex', alignItems:'center', gap:9, padding:'8px 16px 8px 10px',
                background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)',
              }}
            >
              <ScoutAvatar thinking={false} pulseInsight />
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>New insight from Scout</span>
            </button>
          </DynamicIsland>
        )}
      </div>
    </>
  );
};

export default DraftSimulator;