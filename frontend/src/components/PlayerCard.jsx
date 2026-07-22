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

const getSecondaryStats = (player) => {
  const s = player.stats || {};
  if (player.position === 'QB') {
    return [{ label: 'Pass yds', value: s.pass_yd || 0 }, { label: 'Pass TDs', value: s.pass_td || 0 }];
  }
  if (player.position === 'RB') {
    return [{ label: 'Rush yds', value: s.rush_yd || 0 }, { label: 'Rush TDs', value: s.rush_td || 0 }];
  }
  if (player.position === 'WR' || player.position === 'TE') {
    return [{ label: 'Rec yds', value: s.rec_yd || 0 }, { label: 'Receptions', value: s.rec || 0 }];
  }
  if (player.position === 'DEF') {
    return [{ label: 'Sacks', value: s.sack || 0 }, { label: 'INTs', value: s.int || 0 }];
  }
  return [];
};

export default function PlayerCard({ player, onClick }) {
  const meta = POS_META[player.position] || POS_META.K;
  const secondary = getSecondaryStats(player);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(253,250,245,0.7)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(26,24,20,0.08)',
        boxShadow: '0 4px 16px rgba(26,24,20,0.05)',
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <img
          src={getPlayerImage(player)}
          alt={player.full_name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          style={{ background: '#E8E2D5', border: '1px solid rgba(26,24,20,0.08)' }}
          onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: meta.color, background: meta.bg }}
            >
              {player.position}
            </span>
            <span className="text-xs" style={{ color: '#8A8272' }}>{player.team || 'FA'}</span>
          </div>
          <h3 className="text-sm font-semibold truncate" style={{ color: '#1A1814' }}>
            {player.full_name}
          </h3>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold" style={{ color: '#2D6A2D' }}>
            {(player.stats?.pts_ppr || 0).toFixed(1)}
          </div>
          <div className="text-[9px]" style={{ color: '#A89E8E' }}>PTS</div>
        </div>
      </div>

      {secondary.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {secondary.map((stat) => (
            <div
              key={stat.label}
              className="text-center py-2 rounded-lg"
              style={{ background: 'rgba(26,24,20,0.03)' }}
            >
              <div className="text-sm font-semibold" style={{ color: '#1A1814' }}>{stat.value}</div>
              <div className="text-[9px]" style={{ color: '#A89E8E' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
