import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Theme: Warm editorial light — cream surfaces, charcoal type, grass-green accents
// Fonts: Instrument Serif (display) + DM Mono (data) + Geist (body)

const THEME = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base:        #F5F2EC;
    --bg-surface:     #FDFAF5;
    --bg-raised:      #FFFFFF;
    --bg-inset:       #EDE9E0;

    --border-subtle:  rgba(30, 25, 15, 0.08);
    --border-default: rgba(30, 25, 15, 0.14);
    --border-strong:  rgba(30, 25, 15, 0.28);

    --text-primary:   #1A1814;
    --text-secondary: #6B6456;
    --text-muted:     #A89E8E;
    --text-inverse:   #FDFAF5;

    --accent:         #2D6A2D;
    --accent-light:   #EBF5EB;
    --accent-mid:     #4A9B4A;
    --accent-text:    #1E4A1E;

    --cpu-accent:     #8B4513;
    --cpu-light:      #F5EDE3;
    --cpu-text:       #5C2E0A;

    --warn:           #C4570A;
    --warn-light:     #FEF0E6;

    --shadow-sm: 0 1px 3px rgba(30,25,15,0.08), 0 1px 2px rgba(30,25,15,0.04);
    --shadow-md: 0 4px 12px rgba(30,25,15,0.10), 0 2px 4px rgba(30,25,15,0.06);
    --shadow-lg: 0 12px 32px rgba(30,25,15,0.12), 0 4px 8px rgba(30,25,15,0.06);

    --radius-sm:   6px;
    --radius-md:   10px;
    --radius-lg:   14px;
    --radius-xl:   20px;
    --radius-pill: 999px;

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
      background: m.bg, color: m.color,
      fontSize:10, fontWeight:600, fontFamily:'var(--font-mono)',
      padding:'2px 7px', borderRadius:'var(--radius-pill)',
      letterSpacing:'0.04em', border:`1px solid ${m.color}22`, whiteSpace:'nowrap',
    }}>
      {pos}
    </span>
  );
});

// ─── Player Row ───────────────────────────────────────────────────────────────

const PlayerRow = memo(({ player, rank, onDraft, onSelect, isDisabled }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        display:'grid', gridTemplateColumns:'36px 36px 1fr 54px 60px 64px 100px',
        alignItems:'center', gap:8, padding:'10px 16px',
        borderBottom:'1px solid var(--border-subtle)',
        background: hov ? 'var(--bg-raised)' : 'var(--bg-surface)',
        transition:'background 0.1s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', textAlign:'right' }}>{rank}</span>

      <img
        src={getPlayerImage(player)} alt=""
        style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', background:'var(--bg-inset)', border:'1.5px solid var(--border-default)' }}
        onError={e => e.target.src='https://sleepercdn.com/images/v2/icons/player_default.webp'}
        loading="lazy"
      />

      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{player.full_name}</div>
        <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{player.team || 'FA'}</div>
      </div>

      <PosBadge pos={player.position} />

      <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-primary)', fontWeight:500, textAlign:'right' }}>
        {player.stats?.pts_ppr?.toFixed(1) || '—'}
      </span>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', textAlign:'right' }}>
        {player.adp ? Number(player.adp).toFixed(1) : '—'}
      </span>

      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
        <button onClick={() => onSelect(player)} style={S.btnGhost}>INFO</button>
        <button onClick={() => onDraft(player)} disabled={isDisabled} style={isDisabled ? S.btnDisabled : S.btnPrimary}>
          DRAFT
        </button>
      </div>
    </div>
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

const PlayerModal = memo(({ player, onClose, onDraft }) => {
  if (!player) return null;
  const m = POS_META[player.position] || POS_META.K;

  const stats = (() => {
    if (player.position === 'QB') return [
      { label:'Pass Yds', val: player.stats?.pass_yd||0 },
      { label:'Pass TDs', val: player.stats?.pass_td||0 },
      { label:'INTs',     val: player.stats?.pass_int||0 },
    ];
    if (player.position === 'DEF') return [
      { label:'Sacks', val: player.stats?.sack||0 },
      { label:'INTs',  val: player.stats?.int||0 },
      { label:'Pts',   val: player.stats?.pts_ppr?.toFixed(1)||0 },
    ];
    if (player.position === 'K') return [
      { label:'FG Made', val: player.stats?.fgm||0 },
      { label:'FG Att',  val: player.stats?.fga||0 },
      { label:'XP Made', val: player.stats?.xpm||0 },
    ];
    return [
      { label:'Rush Yds', val: player.stats?.rush_yd||0 },
      { label:'Rec Yds',  val: player.stats?.rec_yd||0 },
      { label:'TDs',      val: (player.stats?.rush_td||0)+(player.stats?.rec_td||0) },
    ];
  })();

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:50,
      background:'rgba(20,16,10,0.55)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} className="dz-fade" style={{
        width:'100%', maxWidth:380, background:'var(--bg-raised)',
        borderRadius:'var(--radius-xl)', boxShadow:'var(--shadow-lg)',
        overflow:'hidden', border:'1px solid var(--border-default)',
      }}>
        {/* Header */}
        <div style={{ background:m.bg, padding:'28px 24px 20px', textAlign:'center', position:'relative', borderBottom:'1px solid var(--border-subtle)' }}>
          <button onClick={onClose} style={{
            position:'absolute', top:14, right:14, width:28, height:28,
            borderRadius:'50%', border:'1px solid var(--border-default)',
            background:'var(--bg-raised)', cursor:'pointer', fontSize:12,
            color:'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center',
          }}>✕</button>
          <img src={getPlayerImage(player)} alt={player.full_name}
            style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:`3px solid ${m.color}`, background:'var(--bg-inset)', margin:'0 auto 12px' }}
            onError={e => e.target.src='https://sleepercdn.com/images/v2/icons/player_default.webp'}
          />
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text-primary)', marginBottom:6 }}>{player.full_name}</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <PosBadge pos={player.position} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-secondary)' }}>{player.team}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding:'16px 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
            {[{ label:'PPR Pts', val:player.stats?.pts_ppr?.toFixed(1)||0, accent:true }, ...stats].map((s,i) => (
              <div key={i} style={{
                textAlign:'center', padding:'10px 4px',
                background: i===0 ? m.bg : 'var(--bg-inset)',
                borderRadius:'var(--radius-md)',
                border:`1px solid ${i===0 ? m.color+'33' : 'var(--border-subtle)'}`,
              }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:i===0?18:16, fontWeight:600, color:i===0?m.color:'var(--text-primary)' }}>{s.val}</div>
                <div style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { onDraft(player); onClose(); }}
            style={{ ...S.btnPrimary, width:'100%', padding:'12px', fontSize:13, justifyContent:'center', borderRadius:'var(--radius-md)' }}>
            Draft {player.full_name.split(' ').slice(-1)[0].toUpperCase()}
          </button>
        </div>
      </div>
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

const ScoutAvatar = memo(({ thinking }) => (
  <div style={{ position:'relative', width:24, height:24, flexShrink:0 }}>
    {thinking && (
      <motion.div
        animate={{ rotate:360 }}
        transition={{ repeat:Infinity, duration:1.4, ease:'linear' }}
        style={{
          position:'absolute', inset:-4, borderRadius:'50%',
          background:'conic-gradient(from 0deg, #3FCB6E, #7EC8C8, #FFD166, #3FCB6E)',
          WebkitMask:'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          mask:'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
        }}
      />
    )}
    <motion.div
      animate={{ scale:[1, 1.12, 1] }}
      transition={{ repeat:Infinity, duration:2.2, ease:'easeInOut' }}
      style={{
        position:'absolute', inset:0, borderRadius:'50%',
        background:'linear-gradient(135deg, var(--accent-mid), var(--accent))',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 2px 8px rgba(45,106,45,0.35)',
      }}
    >
      <Sparkles size={12} color="var(--text-inverse)" />
    </motion.div>
  </div>
));

const SuggestionCard = memo(({ player, isMyTurn, onDraft }) => (
  <motion.div
    initial={{ opacity:0, height:0, scale:0.95 }}
    animate={{ opacity:1, height:'auto', scale:1 }}
    transition={{ type:'spring', stiffness:400, damping:28 }}
    style={{
      marginTop:6, marginLeft:28, display:'flex', alignItems:'center', gap:8,
      padding:'9px 11px', borderRadius:12, maxWidth:'85%',
      background:'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(235,245,235,0.4))',
      backdropFilter:'blur(20px) saturate(1.4)', WebkitBackdropFilter:'blur(20px) saturate(1.4)',
      border:'1px solid rgba(255,255,255,0.5)',
      boxShadow:'0 8px 24px rgba(45,106,45,0.14), inset 0 1px 0 rgba(255,255,255,0.7)',
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

const AIChatPanel = memo(({ roster, allPlayers, round, turn, onDraft, isMyTurn }) => {
  const [messages, setMessages] = useState([
    { role:'assistant', text:"Ready to scout. Ask me about any player, your roster needs, or get a recommendation for this round." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

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
    } catch {
      setMessages(p => [...p, { role:'assistant', text:'Scout offline — check your connection.' }]);
    }
    setLoading(false);
  }, [loading, roster, allPlayers, round, turn]);

  const quickPrompts = ['Who should I pick?', 'What position do I need?', 'Best value sleeper?'];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', position:'relative', overflow:'hidden', background:'#EEF3E8' }}>
      <motion.div
        animate={{ x:[0,30,-10,0], y:[0,-20,10,0] }}
        transition={{ repeat:Infinity, duration:14, ease:'easeInOut' }}
        style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'#3FCB6E', opacity:0.35, filter:'blur(60px)', pointerEvents:'none' }}
      />
      <motion.div
        animate={{ x:[0,-25,15,0], y:[0,20,-15,0] }}
        transition={{ repeat:Infinity, duration:16, ease:'easeInOut' }}
        style={{ position:'absolute', top:180, left:-70, width:200, height:200, borderRadius:'50%', background:'#4FA8D8', opacity:0.3, filter:'blur(60px)', pointerEvents:'none' }}
      />
      <motion.div
        animate={{ x:[0,20,-20,0], y:[0,-15,20,0] }}
        transition={{ repeat:Infinity, duration:12, ease:'easeInOut' }}
        style={{ position:'absolute', bottom:-50, right:-30, width:180, height:180, borderRadius:'50%', background:'#FFD166', opacity:0.25, filter:'blur(60px)', pointerEvents:'none' }}
      />

      <div style={{
        flexShrink:0, display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
        borderBottom:'1px solid rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.35)',
        backdropFilter:'blur(24px) saturate(1.6)', WebkitBackdropFilter:'blur(24px) saturate(1.6)',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.6)', position:'relative', zIndex:1,
      }}>
        <ScoutAvatar thinking={loading} />
        <span style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)', letterSpacing:'0.02em' }}>AI Scout</span>
        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, fontSize:9, color:'var(--text-muted)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.04em' }}>
          <span className="dz-blink" style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent-mid)' }} />
          Live
        </span>
      </div>

      <div className="dz-scrollbar" style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10, position:'relative', zIndex:1 }}>
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
                    background: m.role==='user' ? 'linear-gradient(135deg, var(--accent-mid), var(--accent))' : 'rgba(255,255,255,0.45)',
                    backdropFilter: m.role==='user' ? 'none' : 'blur(20px) saturate(1.5)',
                    WebkitBackdropFilter: m.role==='user' ? 'none' : 'blur(20px) saturate(1.5)',
                    color: m.role==='user' ? 'var(--text-inverse)' : 'var(--text-primary)',
                    border: m.role==='user' ? 'none' : '1px solid rgba(255,255,255,0.55)',
                    boxShadow: m.role==='user' ? '0 4px 14px rgba(45,106,45,0.3)' : '0 6px 18px rgba(30,25,15,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
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
              padding:'9px 14px', background:'rgba(255,255,255,0.45)', backdropFilter:'blur(20px) saturate(1.5)', WebkitBackdropFilter:'blur(20px) saturate(1.5)',
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

      {messages.length <= 1 && (
        <div style={{ padding:'0 12px 8px', display:'flex', flexDirection:'column', gap:4, position:'relative', zIndex:1 }}>
          {quickPrompts.map((q, qi) => (
            <motion.button
              key={q}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:qi*0.08 }}
              whileTap={{ scale:0.97 }} whileHover={{ scale:1.02 }}
              onClick={() => send(q)}
              style={{
                padding:'9px 12px', background:'rgba(255,255,255,0.4)', backdropFilter:'blur(16px) saturate(1.4)', WebkitBackdropFilter:'blur(16px) saturate(1.4)',
                border:'1px solid rgba(255,255,255,0.55)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.6)',
                borderRadius:'var(--radius-sm)', fontSize:11, color:'var(--text-secondary)',
                fontFamily:'var(--font-body)', cursor:'pointer', textAlign:'left',
              }}>{q} →</motion.button>
          ))}
        </div>
      )}

      <div style={{
        padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.5)', display:'flex', gap:8, position:'relative', zIndex:1,
        background:'rgba(255,255,255,0.35)', backdropFilter:'blur(24px) saturate(1.6)', WebkitBackdropFilter:'blur(24px) saturate(1.6)',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.6)',
      }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && send(input)}
          placeholder="Ask about a player or pick..."
          style={{
            ...S.input, flex:1, background:'rgba(255,255,255,0.55)',
            backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
            border:'1px solid rgba(255,255,255,0.6)',
          }}
          onFocus={e=>e.target.style.borderColor='var(--accent)'}
          onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.6)'}
        />
        <motion.button whileTap={{ scale:0.94 }} onClick={() => send(input)} disabled={loading||!input.trim()}
          style={loading||!input.trim() ? S.btnDisabled : S.btnPrimary}>
          Ask
        </motion.button>
      </div>
    </div>
  );
});

// ─── Roster Panel ─────────────────────────────────────────────────────────────

const RosterPanel = ({ roster, label, isActive }) => {
  const slots = [['QB','QB'],['RB','RB1'],['RB','RB2'],['WR','WR1'],['WR','WR2'],['TE','TE'],['FLEX','FLEX'],['DEF','DST'],['K','K']];
  return (
    <div style={{
      borderRadius:'var(--radius-lg)',
      border: isActive ? '1.5px solid var(--accent-mid)' : '1px solid var(--border-subtle)',
      overflow:'hidden',
      background: isActive ? '#FBFFF9' : 'var(--bg-surface)',
    }}>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 14px', borderBottom:'1px solid var(--border-subtle)',
        background: isActive ? 'var(--accent-light)' : 'var(--bg-inset)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {isActive && <div className="dz-blink" style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)' }} />}
          <span style={{ fontSize:12, fontWeight:600, color: isActive?'var(--accent-text)':'var(--text-secondary)', letterSpacing:'0.03em' }}>{label}</span>
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)' }}>{countPlayers(roster)}/16</span>
      </div>
      <div style={{ padding:'10px 10px 6px' }}>
        {slots.map(([lbl,key]) => <RosterSlot key={key} label={lbl} player={roster[key]} />)}
        {roster.BENCH.length > 0 && (
          <>
            <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase', padding:'8px 4px 4px', fontFamily:'var(--font-mono)' }}>Bench</div>
            {roster.BENCH.map((p,i) => <RosterSlot key={i} label="BN" player={p} />)}
          </>
        )}
      </div>
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
            background:'rgba(253,250,245,0.6)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
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
  const hasInit = useRef(false);

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
    setTurn(1); setRound(1); setErrorMsg(''); setDone(false); setPickHistory([]); setSidebarTab(0);
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

  return (
    <>
      <style>{THEME}</style>
      <div style={{ height:'100vh', background:'var(--bg-base)', color:'var(--text-primary)', fontFamily:'var(--font-body)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Toast */}
        {errorMsg && (
          <div className="dz-fade" style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', zIndex:100, background:'var(--warn-light)', border:'1px solid var(--warn)', color:'var(--warn)', fontSize:12, fontWeight:500, padding:'8px 16px', borderRadius:'var(--radius-pill)', boxShadow:'var(--shadow-md)', whiteSpace:'nowrap' }}>
            {errorMsg}
          </div>
        )}

        {/* ── Header ──────────────────────────────────────────────── */}
        <header style={{ flexShrink:0, background:'var(--bg-raised)', borderBottom:'1px solid var(--border-default)', padding:'0 24px', height:56, display:'flex', alignItems:'center', gap:20, boxShadow:'var(--shadow-sm)' }}>
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

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>
              Round <strong style={{ color:'var(--text-primary)' }}>{round}</strong>
              <span style={{ margin:'0 8px', color:'var(--border-strong)' }}>·</span>
              Pick <strong style={{ color:'var(--text-primary)' }}>{pickHistory.length+1}</strong>
            </span>
            <div style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'4px 12px', borderRadius:'var(--radius-pill)',
              fontSize:11, fontWeight:600, letterSpacing:'0.04em',
              background: isMyTurn ? 'var(--accent-light)' : aiLoading ? 'var(--cpu-light)' : 'var(--bg-inset)',
              color: isMyTurn ? 'var(--accent-text)' : aiLoading ? 'var(--cpu-text)' : 'var(--text-muted)',
              border:`1px solid ${isMyTurn?'var(--accent-mid)':aiLoading?'var(--cpu-accent)':'var(--border-default)'}44`,
            }}>
              {isMyTurn
                ? <><span className="dz-blink" style={{ width:6,height:6,borderRadius:'50%',background:'var(--accent)',display:'inline-block' }} /> Your pick</>
                : aiLoading
                  ? <><span className="dz-blink" style={{ width:6,height:6,borderRadius:'50%',background:'var(--cpu-accent)',display:'inline-block' }} /> CPU picking…</>
                  : 'Waiting'
              }
            </div>
          </div>

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

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

          {/* Player Pool */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid var(--border-subtle)' }}>

            {/* Search + filters */}
            <div style={{ flexShrink:0, padding:'12px 16px', borderBottom:'1px solid var(--border-subtle)', background:'var(--bg-surface)', display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',width:14,height:14,color:'var(--text-muted)',pointerEvents:'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                  placeholder="Search players…"
                  style={{ ...S.input, paddingLeft:32, width:'100%' }}
                  onFocus={e=>e.target.style.borderColor='var(--accent)'}
                  onBlur={e=>e.target.style.borderColor='var(--border-default)'}
                />
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                {CATEGORIES.map(cat => {
                  const m = POS_META[cat];
                  const active = filterPos===cat;
                  return (
                    <button key={cat} onClick={()=>setFilterPos(cat)} style={{
                      padding:'4px 12px', borderRadius:'var(--radius-pill)',
                      fontSize:11, fontWeight:600, letterSpacing:'0.04em',
                      fontFamily:'var(--font-body)', cursor:'pointer',
                      border: active ? `1px solid ${m?.color||'var(--accent)'}66` : '1px solid var(--border-subtle)',
                      background: active ? (m?.bg||'var(--accent-light)') : 'transparent',
                      color: active ? (m?.color||'var(--accent)') : 'var(--text-secondary)',
                    }}>{cat}</button>
                  );
                })}
                <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)' }}>
                  {displayPlayers.length} available
                </span>
              </div>
            </div>

            {/* Column headers */}
            <div style={{ flexShrink:0, display:'grid', gridTemplateColumns:'36px 36px 1fr 54px 60px 64px 100px', gap:8, padding:'8px 16px', background:'var(--bg-inset)', borderBottom:'1px solid var(--border-default)' }}>
              {['#','','Player','Pos','Pts','ADP',''].map((h,i)=>(
                <span key={i} style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'var(--font-mono)', textAlign:i>=4&&i<=5?'right':'left' }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="dz-scrollbar" style={{ flex:1, overflowY:'auto' }}>
              {displayPlayers.slice(0,120).map((p,i)=>(
                <PlayerRow key={p.player_id} player={p} rank={i+1} onDraft={draftPlayer} onSelect={setSelected} isDisabled={gameMode==='PvAI'&&turn===2} />
              ))}
              {displayPlayers.length===0 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:80, color:'var(--text-muted)', fontSize:13 }}>No players found</div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width:300, flexShrink:0, display:'flex', flexDirection:'column', background:'var(--bg-surface)' }}>

            {/* Tabs */}
            <div style={{ display:'flex', gap:3, padding:4, flexShrink:0, background:'var(--bg-inset)', borderBottom:'1px solid var(--border-default)' }}>
              {SIDEBAR_TABS.map((tab,i)=>(
                <button key={tab} onClick={()=>setSidebarTab(i)} style={{
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
                  <span style={{ position:'relative', zIndex:1 }}>{tab}</span>
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              {sidebarTab===0 && <AIChatPanel roster={rosters.user1} allPlayers={allPlayers} round={round} turn={turn} onDraft={draftPlayer} isMyTurn={isMyTurn} />}
              {sidebarTab===1 && (
                <div className="dz-scrollbar" style={{ flex:1, overflowY:'auto', padding:12 }}>
                  <RosterPanel roster={rosters.user1} label="Team Human" isActive={turn===1} />
                </div>
              )}
              {sidebarTab===2 && (
                <div className="dz-scrollbar" style={{ flex:1, overflowY:'auto', padding:12 }}>
                  <RosterPanel roster={rosters.user2} label="Team CPU" isActive={turn===2} />
                </div>
              )}
            </div>

            {/* Pick history */}
            {pickHistory.length > 0 && (
              <div style={{ flexShrink:0, borderTop:'1px solid var(--border-subtle)', padding:'10px 14px', background:'var(--bg-raised)' }}>
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
      </div>
    </>
  );
};

export default DraftSimulator;