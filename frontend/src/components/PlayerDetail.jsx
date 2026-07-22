import { useState, useEffect } from 'react';
import { ArrowLeft, Youtube } from 'lucide-react';
import axios from 'axios';

const POS_META = {
  QB: { color: '#D4380D', bg: '#FFF2E8' },
  RB: { color: '#389E0D', bg: '#F6FFED' },
  WR: { color: '#096DD9', bg: '#E6F7FF' },
  TE: { color: '#D46B08', bg: '#FFF7E6' },
  DEF: { color: '#531DAB', bg: '#F9F0FF' },
  K: { color: '#08979C', bg: '#E6FFFB' },
};

const getPlayerImage = (player) => {
  if (player.position === 'DEF' && player.team) {
    return `https://sleepercdn.com/images/team_logos/nfl/${player.team.toLowerCase()}.png`;
  }
  return `https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`;
};

const getStatRows = (stats, position) => {
  const s = stats || {};
  if (position === 'QB') {
    return [
      { label: 'Pass attempts', value: s.pass_att || 0 },
      { label: 'Completions', value: s.pass_cmp || 0 },
      { label: 'Pass yards', value: s.pass_yd || 0 },
      { label: 'Pass TDs', value: s.pass_td || 0 },
      { label: 'INTs thrown', value: s.pass_int || 0 },
      { label: 'Rush yards', value: s.rush_yd || 0 },
      { label: 'Rush TDs', value: s.rush_td || 0 },
    ];
  }
  if (position === 'RB') {
    return [
      { label: 'Rush attempts', value: s.rush_att || 0 },
      { label: 'Rush yards', value: s.rush_yd || 0 },
      { label: 'Rush TDs', value: s.rush_td || 0 },
      { label: 'Targets', value: s.rec_tgt || 0 },
      { label: 'Receptions', value: s.rec || 0 },
      { label: 'Rec yards', value: s.rec_yd || 0 },
      { label: 'Fumbles lost', value: s.fum_lost || 0 },
    ];
  }
  if (position === 'WR' || position === 'TE') {
    return [
      { label: 'Targets', value: s.rec_tgt || 0 },
      { label: 'Receptions', value: s.rec || 0 },
      { label: 'Rec yards', value: s.rec_yd || 0 },
      { label: 'Rec TDs', value: s.rec_td || 0 },
      { label: 'Fumbles lost', value: s.fum_lost || 0 },
    ];
  }
  if (position === 'DEF') {
    return [
      { label: 'Sacks', value: s.sack || 0 },
      { label: 'INTs', value: s.int || 0 },
      { label: 'Fumble rec.', value: s.fum_rec || 0 },
      { label: 'Def TDs', value: s.def_td || 0 },
      { label: 'Safeties', value: s.safe || 0 },
      { label: 'Pts allowed', value: s.pts_allow || 0 },
    ];
  }
  return [];
};

export default function PlayerDetail({ player, onBack }) {
  const meta = POS_META[player.position] || POS_META.K;
  const statRows = getStatRows(player.stats, player.position);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    setHistoryLoading(true);
    axios
      .get(`http://localhost:8080/api/players/${player.player_id}/history`)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [player.player_id]);

  const highlightsUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${player.full_name} NFL highlights`)}`;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity"
        style={{ color: '#6B6456' }}
      >
        <ArrowLeft size={16} />
        Back to search
      </button>

      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(26,24,20,0.08)', boxShadow: '0 12px 32px rgba(26,24,20,0.08)' }}
      >
        <div className="h-1.5" style={{ background: meta.color }} />

        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <img
              src={getPlayerImage(player)}
              alt={player.full_name}
              className="w-28 h-28 rounded-2xl object-cover"
              style={{ background: '#E8E2D5', border: '1px solid rgba(26,24,20,0.08)' }}
              onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
            />

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: meta.color, background: meta.bg }}>
                  {player.position}
                </span>
                <span className="text-sm" style={{ color: '#6B6456' }}>{player.team || 'FA'}</span>
              </div>
              <h1 className="dz-heading text-3xl font-bold" style={{ color: '#1A1814' }}>{player.full_name}</h1>
            </div>

            <div
              className="text-center rounded-2xl px-8 py-5"
              style={{ background: '#EBF5EB', border: '1px solid rgba(45,106,45,0.15)' }}
            >
              <div className="text-4xl font-bold" style={{ color: '#2D6A2D' }}>
                {(player.stats?.pts_ppr || 0).toFixed(1)}
              </div>
              <div className="text-xs mt-1" style={{ color: '#4A7A4A' }}>2025 PPR pts</div>
            </div>
          </div>

          {statRows.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statRows.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center rounded-xl p-5"
                  style={{ background: 'rgba(26,24,20,0.03)', border: '1px solid rgba(26,24,20,0.06)' }}
                >
                  <div className="text-2xl font-bold" style={{ color: '#1A1814' }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: '#8A8272' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SEASON HISTORY */}
      <div
        className="rounded-2xl p-8 mb-6"
        style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(26,24,20,0.08)', boxShadow: '0 12px 32px rgba(26,24,20,0.08)' }}
      >
        <h2 className="dz-heading text-lg font-semibold mb-5" style={{ color: '#1A1814' }}>Season history</h2>

        {historyLoading ? (
          <div className="text-sm py-6 text-center" style={{ color: '#8A8272' }}>Loading past seasons…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {history.map((season) => (
              <div
                key={season.season}
                className="rounded-xl p-5"
                style={{ background: 'rgba(26,24,20,0.03)', border: '1px solid rgba(26,24,20,0.06)' }}
              >
                <div className="text-xs font-semibold mb-2" style={{ color: '#A89E8E' }}>{season.season}</div>
                <div className="text-2xl font-bold" style={{ color: '#1A1814' }}>{season.pts_ppr.toFixed(1)}</div>
                <div className="text-xs mt-1" style={{ color: '#8A8272' }}>PPR points</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HIGHLIGHTS */}
      <div
        className="rounded-2xl p-8 flex items-center justify-between gap-6 flex-wrap"
        style={{ background: 'rgba(26,24,20,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <h2 className="dz-heading text-lg font-semibold mb-1" style={{ color: '#FDFAF5' }}>Highlights</h2>
          <p className="text-sm" style={{ color: '#A89E8E' }}>
            Watch {player.full_name}'s latest plays on YouTube.
          </p>
        </div>
        <a
          href={highlightsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ background: '#3FCB6E', color: '#0C2313' }}
        >
          <Youtube size={18} />
          Watch highlights
        </a>
      </div>
    </div>
  );
}
