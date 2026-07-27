import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Logo from './components/Logo';
import ThemeToggle from './components/ThemeToggle';
import { useNotify } from './components/NotificationProvider';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Players', to: '/player-search' },
  { label: 'Draft', to: '/draft' },
  { label: 'Odds', to: '/odds' },
  { label: 'Authors', to: '/authors' },
  { label: 'Bets', to: '/my-bets' },
];

const TEAM_LOGOS = {
  'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
  'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
  'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
  'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
  'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
  'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
  'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
  'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
  'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
  'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
  'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
  'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
  'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
  'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
  'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
  'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
  'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
  'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
  'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
  'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
  'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
  'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
  'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
  'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
  'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
  'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
  'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
  'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
  'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
  'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
  'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
};
const FALLBACK_LOGO = 'https://sleepercdn.com/images/v2/icons/player_default.webp';

const calcWinProb = (price) => {
  if (!price) return '-';
  const decimal = price > 0 ? (100 / (price + 100)) * 100 : (Math.abs(price) / (Math.abs(price) + 100)) * 100;
  return decimal.toFixed(1) + '%';
};

const calculatePayout = (odds, stake) => {
  if (!odds || !stake) return 0;
  if (odds > 0) return stake + stake * (odds / 100);
  return stake + stake / (Math.abs(odds) / 100);
};

export default function Odds({ user, onLogout }) {
  const navigate = useNavigate();
  const notify = useNotify();
  const userId = user?._id;
  const navLinks = user?.role === 'admin' ? [...NAV_LINKS, { label: 'Admin', to: '/admin' }] : NAV_LINKS;

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBet, setSelectedBet] = useState(null);
  const [betAmount, setBetAmount] = useState(100);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const fetchOdds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/odds');
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setGames(data);
    } catch (err) {
      console.error('Error fetching odds:', err);
      setError('Could not load odds right now. Try again shortly.');
    }
    setLoading(false);
  };

  const fetchUserBalance = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/bets/stats/${userId}`);
      const data = await res.json();
      setUserBalance(data.balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  useEffect(() => {
    fetchOdds();
  }, []);

  useEffect(() => {
    fetchUserBalance();
  }, [userId]);

  const handleBetClick = (betData) => {
    if (!userId) {
      navigate('/login');
      return;
    }
    setSelectedBet(betData);
    setShowBetSlip(true);
    setBetAmount(100);
  };

  const placeBet = async () => {
    if (!selectedBet || betAmount <= 0) return;

    if (userBalance !== null && betAmount > userBalance) {
      notify({ type: 'error', title: 'Insufficient balance', message: `You have $${userBalance.toFixed(2)}` });
      return;
    }

    setIsPlacingBet(true);
    try {
      const payload = {
        userId,
        gameId: selectedBet.gameId,
        awayTeam: selectedBet.awayTeam,
        homeTeam: selectedBet.homeTeam,
        teamName: selectedBet.teamName,
        betType: selectedBet.betType,
        odds: selectedBet.odds,
        amount: betAmount,
      };

      const response = await fetch('http://localhost:8080/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setUserBalance(data.newBalance);
        setShowBetSlip(false);
        setSelectedBet(null);
        setBetAmount(100);
        notify({
          type: 'success',
          title: 'Bet placed',
          message: `${selectedBet.betType} · $${betAmount}`,
          meta: [
            { label: 'To win', value: `$${(calculatePayout(selectedBet.odds, betAmount) - betAmount).toFixed(2)}` },
            { label: 'Balance', value: `$${data.newBalance.toFixed(2)}` },
          ],
        });
        navigate('/my-bets');
      } else {
        notify({ type: 'error', title: 'Bet failed', message: data.error });
      }
    } catch (err) {
      console.error('Error placing bet:', err);
      notify({ type: 'error', title: 'Failed to place bet', message: err.message });
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--bg-base)', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .dz-wordmark { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dz-heading { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <nav className="sticky top-0 z-50" style={{ background: 'rgba(var(--bg-base-rgb), 0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(var(--text-primary-rgb), 0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3 min-h-11 flex-shrink-0">
            <Logo size={36} />
            <span className="dz-wordmark text-2xl" style={{ color: 'var(--text-primary)' }}>
              DRAFT<span style={{ color: 'var(--accent)' }}>ZONE</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            {navLinks.map((item) => (
              <Link key={item.label} to={item.to} className="inline-flex items-center min-h-11 px-2 hover:opacity-70 transition-opacity" style={{ color: item.label === 'Odds' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            {userId ? (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full text-sm" style={{ background: 'var(--accent-light)', border: '1px solid rgba(var(--accent-rgb), 0.2)' }}>
                  <span style={{ color: 'var(--accent-text)' }}>Balance: </span>
                  <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                    {userBalance !== null ? `$${userBalance.toFixed(2)}` : '—'}
                  </span>
                </div>
                <button onClick={onLogout} className="inline-flex items-center min-h-11 px-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center min-h-11 px-5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
              >
                Log in to bet
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold mb-4 px-3 py-1.5 rounded-full" style={{ color: 'var(--warn)', background: 'var(--warn-light)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warn)' }} />
            LIVE
          </div>
          <h1 className="dz-heading text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>NFL betting odds</h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Tap any line to place your wager.</p>
        </div>

        {loading && (
          <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>Loading odds…</div>
        )}

        {!loading && error && (
          <div className="text-center py-24">
            <p className="text-base mb-4" style={{ color: 'var(--warn)' }}>{error}</p>
            <button
              onClick={fetchOdds}
              className="inline-flex items-center min-h-11 px-6 rounded-full text-sm font-medium"
              style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <div className="text-center py-24">
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No odds available</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Check back soon for upcoming games.</p>
          </div>
        )}

        {!loading && !error && games.length > 0 && (
          <div className="flex flex-col gap-6">
            {games.map((game, index) => {
              const markets = game.bookmakers?.[0]?.markets || [];
              const moneyline = markets.find((m) => m.key === 'h2h');
              const spreads = markets.find((m) => m.key === 'spreads');
              const totals = markets.find((m) => m.key === 'totals');

              return (
                <div
                  key={index}
                  className="rounded-2xl p-6 md:p-8"
                  style={{ background: 'rgba(var(--bg-surface-rgb), 0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(var(--text-primary-rgb), 0.08)' }}
                >
                  <div className="flex items-center justify-between mb-6 pb-6 flex-wrap gap-4" style={{ borderBottom: '1px solid rgba(var(--text-primary-rgb), 0.08)' }}>
                    <div className="flex items-center gap-4 flex-1 min-w-[160px]">
                      <img
                        src={TEAM_LOGOS[game.away_team] || FALLBACK_LOGO}
                        onError={(e) => { e.target.src = FALLBACK_LOGO; }}
                        className="h-14 w-14 rounded-xl p-2"
                        style={{ background: 'rgba(var(--text-primary-rgb), 0.04)', border: '1px solid rgba(var(--text-primary-rgb), 0.06)' }}
                        alt={game.away_team}
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Away</p>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{game.away_team}</h2>
                      </div>
                    </div>

                    <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(var(--text-primary-rgb), 0.04)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>VS</span>
                    </div>

                    <div className="flex items-center gap-4 flex-row-reverse flex-1 min-w-[160px] text-right">
                      <img
                        src={TEAM_LOGOS[game.home_team] || FALLBACK_LOGO}
                        onError={(e) => { e.target.src = FALLBACK_LOGO; }}
                        className="h-14 w-14 rounded-xl p-2"
                        style={{ background: 'rgba(var(--text-primary-rgb), 0.04)', border: '1px solid rgba(var(--text-primary-rgb), 0.06)' }}
                        alt={game.home_team}
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Home</p>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{game.home_team}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { key: 'ml', title: 'Moneyline', market: moneyline, render: (team) => ({
                        label: team.name,
                        big: `${team.price > 0 ? '+' : ''}${team.price}`,
                        bet: { gameId: game.id, teamName: team.name, betType: 'MONEYLINE', odds: team.price, awayTeam: game.away_team, homeTeam: game.home_team },
                        prob: calcWinProb(team.price),
                      }) },
                      { key: 'sp', title: 'Spread', market: spreads, render: (team) => ({
                        label: team.name,
                        big: `${team.point > 0 ? '+' : ''}${team.point}`,
                        sub: `(${team.price})`,
                        bet: { gameId: game.id, teamName: team.name, betType: `SPREAD ${team.point > 0 ? '+' : ''}${team.point}`, odds: team.price, spread: team.point, awayTeam: game.away_team, homeTeam: game.home_team },
                        prob: calcWinProb(team.price),
                      }) },
                      { key: 'tot', title: 'Over/under', market: totals, render: (line) => ({
                        label: line.name,
                        big: `${line.point}`,
                        sub: `(${line.price})`,
                        bet: { gameId: game.id, teamName: line.name, betType: `${line.name} ${line.point}`, odds: line.price, total: line.point, awayTeam: game.away_team, homeTeam: game.home_team },
                        prob: calcWinProb(line.price),
                      }) },
                    ].map(({ key, title, market, render }) => market && (
                      <div key={key} className="rounded-xl p-5" style={{ background: 'rgba(var(--text-primary-rgb), 0.03)', border: '1px solid rgba(var(--text-primary-rgb), 0.06)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>{title}</p>
                        {market.outcomes.map((outcome, idx) => {
                          const o = render(outcome);
                          return (
                            <div
                              key={idx}
                              onClick={() => handleBetClick(o.bet)}
                              className="p-4 rounded-lg mb-2 last:mb-0 cursor-pointer transition-colors hover:opacity-80"
                              style={{ background: 'rgba(var(--bg-surface-rgb), 0.9)', border: '1px solid rgba(var(--text-primary-rgb), 0.06)' }}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{o.label}</span>
                                <span className="font-bold" style={{ color: 'var(--accent)' }}>
                                  {o.big} {o.sub && <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{o.sub}</span>}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span style={{ color: 'var(--text-muted)' }}>Win probability</span>
                                <span className="font-semibold" style={{ color: 'var(--accent)' }}>{o.prob}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showBetSlip && selectedBet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(var(--text-primary-rgb), 0.5)', backdropFilter: 'blur(4px)' }}>
          <div
            className="rounded-2xl p-8 max-w-lg w-full"
            style={{ background: 'rgba(var(--bg-surface-rgb), 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(var(--text-primary-rgb), 0.1)', boxShadow: '0 24px 60px rgba(var(--text-primary-rgb), 0.25)' }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="dz-heading text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Place your bet</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Review and confirm your wager</p>
              </div>
              <button onClick={() => { setShowBetSlip(false); setSelectedBet(null); }} className="hover:opacity-70 transition-opacity">
                <X size={22} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(var(--text-primary-rgb), 0.03)', border: '1px solid rgba(var(--text-primary-rgb), 0.06)' }}>
              <div className="text-center mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Matchup</p>
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedBet.awayTeam} @ {selectedBet.homeTeam}
                </p>
              </div>
              <div className="h-px my-4" style={{ background: 'rgba(var(--text-primary-rgb), 0.08)' }} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Bet type</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedBet.betType}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{selectedBet.teamName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Odds</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                    {selectedBet.odds > 0 ? '+' : ''}{selectedBet.odds}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-primary)' }}>Bet amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--accent)' }}>$</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl pl-9 pr-4 py-3.5 text-lg font-semibold outline-none"
                  style={{ background: 'rgba(var(--bg-surface-rgb), 0.9)', border: '1px solid rgba(var(--text-primary-rgb), 0.1)', color: 'var(--text-primary)' }}
                  min="1"
                  step="1"
                />
              </div>
              <div className="flex gap-2 mt-3">
                {[25, 50, 100, 250, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb), 0.2)' }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-5 mb-6" style={{ background: 'var(--accent-light)', border: '1px solid rgba(var(--accent-rgb), 0.25)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-text)' }}>To win</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                    ${(calculatePayout(selectedBet.odds, betAmount) - betAmount).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-text)' }}>Total payout</p>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ${calculatePayout(selectedBet.odds, betAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowBetSlip(false); setSelectedBet(null); }}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: 'rgba(var(--text-primary-rgb), 0.06)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                onClick={placeBet}
                disabled={betAmount <= 0 || isPlacingBet}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
              >
                {isPlacingBet ? 'Placing…' : 'Place bet'}
              </button>
            </div>

            <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
              Must be 21+ and in eligible state. Gambling problem? Call 1-800-GAMBLER
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
