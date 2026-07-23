import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Players', to: '/player-search' },
  { label: 'Draft', to: '/draft' },
  { label: 'Odds', to: '/odds' },
  { label: 'Authors', to: '/authors' },
  { label: 'Bets', to: '/my-bets' },
];

const STATUS_STYLE = {
  won: { color: '#2D6A2D', bg: '#EBF5EB' },
  lost: { color: '#C4570A', bg: '#FEF0E6' },
  pending: { color: '#8A6D1D', bg: '#FBF3D9' },
};

export default function MyBets({ user, onLogout }) {
  const userId = user?._id;
  const navLinks = user?.role === 'admin' ? [...NAV_LINKS, { label: 'Admin', to: '/admin' }] : NAV_LINKS;
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingBets, setPendingBets] = useState([]);
  const [betHistory, setBetHistory] = useState([]);
  const [userStats, setUserStats] = useState({ balance: 0, totalWagered: 0, totalWon: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchBets();
  }, [userId]);

  const fetchBets = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch(`http://localhost:8080/api/bets/stats/${userId}`);
      setUserStats(await statsRes.json());

      const pendingRes = await fetch(`http://localhost:8080/api/bets/pending/${userId}`);
      setPendingBets(await pendingRes.json());

      const historyRes = await fetch(`http://localhost:8080/api/bets/user/${userId}`);
      const historyData = await historyRes.json();
      setBetHistory(historyData.filter((bet) => bet.status !== 'pending'));
    } catch (error) {
      console.error('Error fetching bets: ', error);
    }
    setLoading(false);
  };

  const wonCount = betHistory.filter((b) => b.status === 'won').length;
  const lostCount = betHistory.filter((b) => b.status === 'lost').length;
  const winRate = wonCount + lostCount === 0 ? '0%' : `${((wonCount / (wonCount + lostCount)) * 100).toFixed(1)}%`;

  const STAT_CARDS = [
    { label: 'Current balance', value: `$${(userStats.balance || 0).toFixed(2)}`, color: '#2D6A2D' },
    { label: 'Total wagered', value: `$${(userStats.totalWagered || 0).toFixed(2)}`, color: '#1A1814' },
    { label: 'Total won', value: `$${(userStats.totalWon || 0).toFixed(2)}`, color: '#2D6A2D' },
    { label: 'Win rate', value: winRate, sub: `${wonCount}W - ${lostCount}L`, color: '#1A1814' },
  ];

  const BetCard = ({ bet }) => {
    const status = STATUS_STYLE[bet.status] || STATUS_STYLE.pending;
    return (
      <div className="rounded-2xl p-6" style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,24,20,0.08)' }}>
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-bold" style={{ color: '#1A1814' }}>{bet.awayTeam} @ {bet.homeTeam}</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: status.color, background: status.bg }}>
                {bet.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: '#2D6A2D', background: '#EBF5EB' }}>
                {bet.betType}
              </span>
              <span style={{ color: '#8A8272' }}>on {bet.teamName}</span>
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: status.color }}>
            {bet.odds > 0 ? '+' : ''}{bet.odds}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid rgba(26,24,20,0.06)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: '#8A8272' }}>Wagered</p>
            <p className="text-base font-semibold" style={{ color: '#1A1814' }}>${bet.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#8A8272' }}>{bet.status === 'lost' ? 'Lost' : 'To win'}</p>
            <p className="text-base font-semibold" style={{ color: bet.status === 'lost' ? '#C4570A' : '#2D6A2D' }}>
              ${(bet.status === 'lost' ? bet.amount : bet.profit).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#8A8272' }}>Payout</p>
            <p className="text-base font-semibold" style={{ color: '#1A1814' }}>
              ${bet.status === 'lost' ? '0.00' : bet.potentialPayout.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 flex justify-between items-center flex-wrap gap-1" style={{ borderTop: '1px solid rgba(26,24,20,0.06)' }}>
          <p className="text-xs" style={{ color: '#A89E8E' }}>
            Placed {new Date(bet.placedAt).toLocaleDateString()}
          </p>
          {bet.settledAt && (
            <p className="text-xs" style={{ color: '#A89E8E' }}>
              Settled {new Date(bet.settledAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen" style={{ background: '#F5F2EC', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .dz-wordmark { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dz-heading { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <nav className="sticky top-0 z-50" style={{ background: 'rgba(245,242,236,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <Logo size={36} />
            <span className="dz-wordmark text-2xl" style={{ color: '#1A1814' }}>
              DRAFT<span style={{ color: '#2D6A2D' }}>ZONE</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            {navLinks.map((item) => (
              <Link key={item.label} to={item.to} className="hover:opacity-70 transition-opacity" style={{ color: item.label === 'Bets' ? '#1A1814' : '#6B6456' }}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="px-4 py-2 rounded-full text-sm" style={{ background: '#EBF5EB', border: '1px solid rgba(45,106,45,0.2)' }}>
              <span style={{ color: '#4A7A4A' }}>Balance: </span>
              <span className="font-semibold" style={{ color: '#2D6A2D' }}>${(userStats.balance || 0).toFixed(2)}</span>
            </div>
            <button onClick={onLogout} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#6B6456' }}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="dz-heading text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1A1814' }}>Bet tracker</h1>
          <p className="text-base" style={{ color: '#6B6456' }}>Track your wagers and winnings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6" style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,24,20,0.08)' }}>
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: '#8A8272' }}>{stat.label}</div>
              {stat.sub && <div className="text-xs mt-1" style={{ color: '#A89E8E' }}>{stat.sub}</div>}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-8" style={{ borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
          {[{ key: 'pending', label: `Pending bets (${pendingBets.length})` }, { key: 'history', label: `Bet history (${betHistory.length})` }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-5 py-3 text-sm font-semibold transition-colors"
              style={{
                color: activeTab === tab.key ? '#2D6A2D' : '#8A8272',
                borderBottom: activeTab === tab.key ? '2px solid #2D6A2D' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-24" style={{ color: '#8A8272' }}>Loading bets…</div>
        )}

        {!loading && activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingBets.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-lg font-semibold mb-2" style={{ color: '#1A1814' }}>No pending bets</p>
                <p className="text-sm mb-6" style={{ color: '#8A8272' }}>Place your first bet to get started.</p>
                <Link to="/odds" className="inline-block px-6 py-2.5 rounded-full text-sm font-medium" style={{ background: '#1A1814', color: '#FDFAF5' }}>
                  View odds
                </Link>
              </div>
            ) : (
              pendingBets.map((bet) => <BetCard key={bet._id} bet={bet} />)
            )}
          </div>
        )}

        {!loading && activeTab === 'history' && (
          <div className="space-y-4">
            {betHistory.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-lg font-semibold mb-2" style={{ color: '#1A1814' }}>No bet history yet</p>
                <p className="text-sm" style={{ color: '#8A8272' }}>Your completed bets will appear here.</p>
              </div>
            ) : (
              betHistory.map((bet) => <BetCard key={bet._id} bet={bet} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
