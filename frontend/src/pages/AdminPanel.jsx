import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Logo from '../components/Logo';
import { useNotify } from '../components/NotificationProvider';

const GAME_MODE_FILTERS = ['All', 'PVP', 'PvAI'];
const STATUS_FILTERS = ['All', 'COMPLETED', 'IN_PROGRESS'];

const AdminPanel = ({ onLogout }) => {
  const notify = useNotify();
  const [activeTab, setActiveTab] = useState('drafts');

  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [pendingBets, setPendingBets] = useState([]);
  const [betsLoading, setBetsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [balanceDrafts, setBalanceDrafts] = useState({});

  useEffect(() => {
    fetchDrafts();
    fetchPendingBets();
    fetchUsers();
  }, []);

  const fetchDrafts = async () => {
    try {
      setDraftsLoading(true);
      const res = await axios.get('http://localhost:8080/api/drafts');
      setDrafts(res.data);
    } catch (err) {
      console.error('Failed to load drafts', err);
    } finally {
      setDraftsLoading(false);
    }
  };

  const fetchPendingBets = async () => {
    try {
      setBetsLoading(true);
      const res = await axios.get('http://localhost:8080/api/bets/pending');
      setPendingBets(res.data);
    } catch (err) {
      console.error('Failed to load pending bets', err);
    } finally {
      setBetsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await axios.get('http://localhost:8080/api/users');
      setUsers(res.data);
      const drafts = {};
      res.data.forEach((u) => { drafts[u._id] = u.balance; });
      setBalanceDrafts(drafts);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const refreshAll = () => { fetchDrafts(); fetchPendingBets(); fetchUsers(); };

  const handleDeleteDraft = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this draft?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/drafts/${id}`);
      await fetchDrafts();
      notify({ type: 'success', title: 'Draft deleted' });
    } catch (err) {
      notify({ type: 'error', title: 'Error deleting draft' });
      console.error(err);
    }
  };

  const settleBet = async (betId, status) => {
    try {
      await axios.patch(`http://localhost:8080/api/bets/${betId}/settle`, { status });
      await Promise.all([fetchPendingBets(), fetchUsers()]);
      notify({ type: 'success', title: status === 'won' ? 'Bet marked won' : 'Bet marked lost' });
    } catch (err) {
      notify({ type: 'error', title: 'Failed to settle bet' });
      console.error(err);
    }
  };

  const saveBalance = async (userId) => {
    const newBalance = parseFloat(balanceDrafts[userId]);
    if (isNaN(newBalance) || newBalance < 0) {
      notify({ type: 'error', title: 'Enter a valid balance' });
      return;
    }
    try {
      await axios.patch(`http://localhost:8080/api/users/${userId}/balance`, { balance: newBalance });
      await fetchUsers();
      notify({ type: 'success', title: 'Balance updated', message: `New balance: $${newBalance.toFixed(2)}` });
    } catch (err) {
      notify({ type: 'error', title: 'Failed to update balance' });
      console.error(err);
    }
  };

  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString() : 'N/A');

  const filteredDrafts = drafts.filter(
    (d) => (modeFilter === 'All' || (d.gameMode || 'PVP') === modeFilter) && (statusFilter === 'All' || d.status === statusFilter)
  );

  const STAT_CARDS = [
    { label: 'Total drafts', value: drafts.length, color: '#1A1814' },
    { label: 'Completed games', value: drafts.filter((d) => d.status === 'COMPLETED').length, color: '#2D6A2D' },
    { label: 'Pending bets', value: pendingBets.length, color: '#C4570A' },
    { label: 'Registered users', value: users.length, color: '#096DD9' },
  ];

  const TABS = [
    { key: 'drafts', label: `Drafts (${drafts.length})` },
    { key: 'bets', label: `Pending bets (${pendingBets.length})` },
    { key: 'users', label: `Users (${users.length})` },
  ];

  return (
    <div className="w-full min-h-screen" style={{ background: '#F5F2EC', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .dz-wordmark { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dz-heading { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <nav className="sticky top-0 z-50" style={{ background: 'rgba(245,242,236,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <span className="dz-wordmark text-2xl" style={{ color: '#1A1814' }}>
              DRAFT<span style={{ color: '#2D6A2D' }}>ZONE</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: '#1A1814', color: '#FDFAF5' }}>
              Admin
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#6B6456' }}>
              <ArrowLeft size={16} />
              Exit to site
            </Link>
            <button onClick={onLogout} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#6B6456' }}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#2D6A2D' }}>
              Dashboard
            </div>
            <h1 className="dz-heading text-3xl font-bold" style={{ color: '#1A1814' }}>Admin overview</h1>
          </div>
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: '#1A1814', color: '#FDFAF5' }}
          >
            <RefreshCw size={14} />
            Refresh data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,24,20,0.08)' }}
            >
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: '#8A8272' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
          {TABS.map((tab) => (
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

        {activeTab === 'drafts' && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,24,20,0.08)' }}
          >
            <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
              <h2 className="dz-heading text-lg font-semibold" style={{ color: '#1A1814' }}>Draft history</h2>
              <div className="flex flex-wrap gap-2">
                {GAME_MODE_FILTERS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setModeFilter(m)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                    style={modeFilter === m ? { background: '#1A1814', color: '#FDFAF5' } : { background: 'rgba(26,24,20,0.05)', color: '#6B6456' }}
                  >
                    {m}
                  </button>
                ))}
                <span className="w-px" style={{ background: 'rgba(26,24,20,0.1)' }} />
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                    style={statusFilter === s ? { background: '#1A1814', color: '#FDFAF5' } : { background: 'rgba(26,24,20,0.05)', color: '#6B6456' }}
                  >
                    {s === 'IN_PROGRESS' ? 'In progress' : s === 'COMPLETED' ? 'Completed' : s}
                  </button>
                ))}
              </div>
            </div>

            {draftsLoading ? (
              <div className="p-12 text-center text-sm" style={{ color: '#8A8272' }}>Loading records…</div>
            ) : filteredDrafts.length === 0 ? (
              <div className="p-12 text-center text-sm" style={{ color: '#8A8272' }}>No drafts match these filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: 'rgba(26,24,20,0.03)' }}>
                      {['Date / time', 'Game mode', 'Status', 'Winner / score', ''].map((h, i) => (
                        <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`} style={{ color: '#8A8272' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrafts.map((draft) => (
                      <tr key={draft._id} style={{ borderTop: '1px solid rgba(26,24,20,0.06)' }}>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>
                          <div>{formatDate(draft.createdAt)}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#A89E8E' }}>{draft._id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={draft.gameMode === 'PvAI' ? { color: '#531DAB', background: '#F9F0FF' } : { color: '#096DD9', background: '#E6F7FF' }}
                          >
                            {draft.gameMode || 'PVP'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {draft.status === 'COMPLETED' ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#2D6A2D', background: '#EBF5EB' }}>Completed</span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#C4570A', background: '#FEF0E6' }}>In progress</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>
                          {draft.results ? (
                            <div>
                              <span className="font-semibold">{draft.results.winner}</span>
                              <div className="text-xs mt-0.5" style={{ color: '#A89E8E' }}>{draft.results.score1} - {draft.results.score2}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#A89E8E' }}>—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteDraft(draft._id)}
                            className="text-xs font-semibold px-3 py-2 rounded-full transition-colors"
                            style={{ color: '#C4570A', border: '1px solid rgba(196,87,10,0.3)' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bets' && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,24,20,0.08)' }}
          >
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
              <h2 className="dz-heading text-lg font-semibold" style={{ color: '#1A1814' }}>Pending bets</h2>
            </div>

            {betsLoading ? (
              <div className="p-12 text-center text-sm" style={{ color: '#8A8272' }}>Loading bets…</div>
            ) : pendingBets.length === 0 ? (
              <div className="p-12 text-center text-sm" style={{ color: '#8A8272' }}>No pending bets to settle.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: 'rgba(26,24,20,0.03)' }}>
                      {['User', 'Matchup', 'Bet', 'Amount', 'To win', ''].map((h, i) => (
                        <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`} style={{ color: '#8A8272' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBets.map((bet) => (
                      <tr key={bet._id} style={{ borderTop: '1px solid rgba(26,24,20,0.06)' }}>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>{bet.userEmail || bet.userId}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>{bet.awayTeam} @ {bet.homeTeam}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>
                          <div>{bet.betType}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#A89E8E' }}>{bet.teamName}</div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>${bet.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#2D6A2D' }}>${bet.profit.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => settleBet(bet._id, 'won')}
                            className="text-xs font-semibold px-3 py-2 rounded-full mr-2 transition-colors"
                            style={{ color: '#2D6A2D', border: '1px solid rgba(45,106,45,0.3)' }}
                          >
                            Mark won
                          </button>
                          <button
                            onClick={() => settleBet(bet._id, 'lost')}
                            className="text-xs font-semibold px-3 py-2 rounded-full transition-colors"
                            style={{ color: '#C4570A', border: '1px solid rgba(196,87,10,0.3)' }}
                          >
                            Mark lost
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,24,20,0.08)' }}
          >
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
              <h2 className="dz-heading text-lg font-semibold" style={{ color: '#1A1814' }}>Registered users</h2>
            </div>

            {usersLoading ? (
              <div className="p-12 text-center text-sm" style={{ color: '#8A8272' }}>Loading users…</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-sm" style={{ color: '#8A8272' }}>No registered users.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: 'rgba(26,24,20,0.03)' }}>
                      {['Email', 'Role', 'Wagered', 'Won', 'Balance', ''].map((h, i) => (
                        <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`} style={{ color: '#8A8272' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderTop: '1px solid rgba(26,24,20,0.06)' }}>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={u.role === 'admin' ? { color: '#1A1814', background: 'rgba(26,24,20,0.08)' } : { color: '#096DD9', background: '#E6F7FF' }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>${(u.totalWagered || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>${(u.totalWon || 0).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={balanceDrafts[u._id] ?? u.balance}
                            onChange={(e) => setBalanceDrafts((prev) => ({ ...prev, [u._id]: e.target.value }))}
                            className="w-24 text-sm rounded-lg px-2 py-1.5 outline-none"
                            style={{ background: 'rgba(26,24,20,0.04)', border: '1px solid rgba(26,24,20,0.1)', color: '#1A1814' }}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => saveBalance(u._id)}
                            disabled={parseFloat(balanceDrafts[u._id]) === u.balance}
                            className="text-xs font-semibold px-3 py-2 rounded-full transition-colors disabled:opacity-40"
                            style={{ background: '#1A1814', color: '#FDFAF5' }}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
