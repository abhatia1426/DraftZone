import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import PlayerCard from '../components/PlayerCard';
import PlayerDetail from '../components/PlayerDetail';
import AppNav from '../components/AppNav';
import DynamicIsland from '../components/DynamicIsland';
import { useMotionPresets } from '../lib/motion';

const MotionDiv = motion.div;
const FOCUS_RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]';

const CATEGORIES = ['All', 'QB', 'RB', 'WR', 'TE', 'DEF', 'K'];
const PAGE_SIZE = 60;

export default function PlayerSearchPage({ user, onLogout }) {
  const { fadeUp, fadeUpSm } = useMotionPresets();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('points');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:8080/api/players/fetch');
        setPlayers(res.data);
      } catch {
        setError('Could not load players. Is the backend running?');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return players.filter((p) => {
      const matchesQuery = p.full_name.toLowerCase().includes(term) || (p.team || '').toLowerCase().includes(term);
      const matchesFilter = filter === 'All' || p.position === filter;
      return matchesQuery && matchesFilter;
    });
  }, [players, query, filter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === 'points') list.sort((a, b) => (b.stats?.pts_ppr || 0) - (a.stats?.pts_ppr || 0));
    else if (sortBy === 'name') list.sort((a, b) => a.full_name.localeCompare(b.full_name));
    return list;
  }, [filtered, sortBy]);

  const positionCounts = useMemo(() => {
    const counts = { All: players.length };
    CATEGORIES.slice(1).forEach((pos) => {
      counts[pos] = players.filter((p) => p.position === pos).length;
    });
    return counts;
  }, [players]);

  const visible = sorted.slice(0, visibleCount);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, filter, sortBy]);

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--bg-base)', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .dz-wordmark { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dz-heading { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {!selectedPlayer && (
        <DynamicIsland
          expanded={filter !== 'All' || query.trim() !== ''}
          collapsed={<Search size={14} style={{ color: 'var(--text-inverse)' }} aria-hidden="true" />}
        >
          <div className="flex items-center gap-3 pl-4 pr-2 py-2">
            <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
              {filter !== 'All' ? filter : 'Search'}{query.trim() ? ` “${query.trim()}”` : ''}
            </span>
            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              {sorted.length} {sorted.length === 1 ? 'result' : 'results'}
            </span>
            <button
              onClick={() => { setQuery(''); setFilter('All'); }}
              className={`ml-1 flex items-center justify-center h-6 w-6 rounded-full hover:opacity-80 transition-opacity ${FOCUS_RING}`}
              style={{ background: 'rgba(var(--text-primary-rgb), 0.08)' }}
              aria-label="Clear search and filters"
            >
              <X size={13} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </DynamicIsland>
      )}

      <AppNav user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-6 py-14">
        {!selectedPlayer ? (
          <>
            <MotionDiv {...fadeUp} className="text-center mb-10">
              <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
                Player database
              </div>
              <h1 className="dz-heading text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Find your next fantasy star
              </h1>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Search {players.length ? `${players.length}+` : ''} real NFL players with live 2025 stats.
              </p>
            </MotionDiv>

            <MotionDiv {...fadeUpSm(0.05)} className="mb-6">
              <label htmlFor="player-search-input" className="sr-only">Search players or teams</label>
              <SearchBar id="player-search-input" query={query} setQuery={setQuery} />
            </MotionDiv>

            <MotionDiv {...fadeUpSm(0.1)} className="flex flex-wrap gap-2 mb-8 justify-center">
              {CATEGORIES.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setFilter(pos)}
                  aria-pressed={filter === pos}
                  className={`inline-flex items-center min-h-11 px-5 rounded-full text-sm font-medium transition-all ${FOCUS_RING}`}
                  style={
                    filter === pos
                      ? { background: 'var(--text-primary)', color: 'var(--text-inverse)' }
                      : { background: 'rgba(var(--bg-surface-rgb), 0.7)', color: 'var(--text-secondary)', border: '1px solid rgba(var(--text-primary-rgb), 0.1)' }
                  }
                >
                  {pos} <span className="opacity-60">({positionCounts[pos] ?? 0})</span>
                </button>
              ))}
            </MotionDiv>

            <div className="flex items-center justify-between mb-5 px-1">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {sorted.length} {sorted.length === 1 ? 'player' : 'players'}
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="player-sort-select" className="text-sm" style={{ color: 'var(--text-muted)' }}>Sort by:</label>
                <select
                  id="player-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`text-sm font-medium rounded-lg px-3 min-h-11 outline-none ${FOCUS_RING}`}
                  style={{ background: 'rgba(var(--bg-surface-rgb), 0.7)', color: 'var(--text-primary)', border: '1px solid rgba(var(--text-primary-rgb), 0.1)' }}
                >
                  <option value="points">Fantasy points</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="text-center py-24" style={{ color: 'var(--text-muted)' }} role="status">Loading players…</div>
            )}

            {!loading && error && (
              <div className="text-center py-24" style={{ color: 'var(--warn)' }} role="alert">{error}</div>
            )}

            {!loading && !error && (
              <>
                {visible.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visible.map((p, i) => (
                      <MotionDiv key={p.player_id} {...fadeUpSm((i % 6) * 0.04)}>
                        <PlayerCard player={p} onClick={() => setSelectedPlayer(p)} />
                      </MotionDiv>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <h2 className="dz-heading text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No players found</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
                    <button
                      onClick={() => { setQuery(''); setFilter('All'); }}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium ${FOCUS_RING}`}
                      style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}

                {visible.length < sorted.length && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity ${FOCUS_RING}`}
                      style={{ background: 'rgba(var(--bg-surface-rgb), 0.7)', color: 'var(--text-primary)', border: '1px solid rgba(var(--text-primary-rgb), 0.1)' }}
                    >
                      Show more players
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <PlayerDetail player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />
        )}
      </div>
    </div>
  );
}
