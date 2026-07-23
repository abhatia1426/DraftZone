import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import PlayerCard from '../components/PlayerCard';
import PlayerDetail from '../components/PlayerDetail';
import Logo from '../components/Logo';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Players', to: '/player-search' },
  { label: 'Draft', to: '/draft' },
  { label: 'Odds', to: '/odds' },
  { label: 'Authors', to: '/authors' },
  { label: 'Bets', to: '/my-bets' },
];

const CATEGORIES = ['All', 'QB', 'RB', 'WR', 'TE', 'DEF', 'K'];
const PAGE_SIZE = 60;

export default function PlayerSearchPage({ user, onLogout }) {
  const navLinks = user?.role === 'admin' ? [...NAV_LINKS, { label: 'Admin', to: '/admin' }] : NAV_LINKS;
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
      } catch (err) {
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
    <div className="w-full min-h-screen" style={{ background: '#F5F2EC', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .dz-wordmark { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dz-heading { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <nav className="sticky top-0 z-50" style={{ background: 'rgba(245,242,236,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} />
            <span className="dz-wordmark text-2xl" style={{ color: '#1A1814' }}>
              DRAFT<span style={{ color: '#2D6A2D' }}>ZONE</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            {navLinks.map((item) => (
              <Link key={item.label} to={item.to} className="hover:opacity-70 transition-opacity" style={{ color: '#6B6456' }}>
                {item.label}
              </Link>
            ))}
          </div>
          {user ? (
            <button
              onClick={onLogout}
              className="hidden md:inline-block px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ background: '#1A1814', color: '#FDFAF5' }}
            >
              Log out
            </button>
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

      <div className="max-w-6xl mx-auto px-6 py-14">
        {!selectedPlayer ? (
          <>
            <div className="text-center mb-10">
              <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#2D6A2D' }}>
                Player database
              </div>
              <h1 className="dz-heading text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1A1814' }}>
                Find your next fantasy star
              </h1>
              <p className="text-base" style={{ color: '#6B6456' }}>
                Search {players.length ? `${players.length}+` : ''} real NFL players with live 2025 stats.
              </p>
            </div>

            <div className="mb-6">
              <SearchBar query={query} setQuery={setQuery} />
            </div>

            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {CATEGORIES.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setFilter(pos)}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                  style={
                    filter === pos
                      ? { background: '#1A1814', color: '#FDFAF5' }
                      : { background: 'rgba(253,250,245,0.7)', color: '#6B6456', border: '1px solid rgba(26,24,20,0.1)' }
                  }
                >
                  {pos} <span className="opacity-60">({positionCounts[pos] ?? 0})</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-5 px-1">
              <span className="text-sm" style={{ color: '#6B6456' }}>
                {sorted.length} {sorted.length === 1 ? 'player' : 'players'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: '#8A8272' }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-medium rounded-lg px-3 py-1.5 outline-none"
                  style={{ background: 'rgba(253,250,245,0.7)', color: '#1A1814', border: '1px solid rgba(26,24,20,0.1)' }}
                >
                  <option value="points">Fantasy points</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="text-center py-24" style={{ color: '#8A8272' }}>Loading players…</div>
            )}

            {!loading && error && (
              <div className="text-center py-24" style={{ color: '#C4570A' }}>{error}</div>
            )}

            {!loading && !error && (
              <>
                {visible.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visible.map((p) => (
                      <PlayerCard key={p.player_id} player={p} onClick={() => setSelectedPlayer(p)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <h3 className="dz-heading text-xl font-semibold mb-2" style={{ color: '#1A1814' }}>No players found</h3>
                    <p className="text-sm mb-6" style={{ color: '#8A8272' }}>Try adjusting your search or filters.</p>
                    <button
                      onClick={() => { setQuery(''); setFilter('All'); }}
                      className="px-6 py-2.5 rounded-full text-sm font-medium"
                      style={{ background: '#1A1814', color: '#FDFAF5' }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}

                {visible.length < sorted.length && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                      style={{ background: 'rgba(253,250,245,0.7)', color: '#1A1814', border: '1px solid rgba(26,24,20,0.1)' }}
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
