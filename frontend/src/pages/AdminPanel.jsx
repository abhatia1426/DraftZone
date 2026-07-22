import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Logo from '../components/Logo';
import { useNotify } from '../components/NotificationProvider';

const AdminPanel = ({ onLogout }) => {
  const notify = useNotify();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalDrafts: 0, completed: 0, active: 0 });

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/drafts');
      const data = res.data;
      setDrafts(data);
      setStats({
        totalDrafts: data.length,
        completed: data.filter((d) => d.status === 'COMPLETED').length,
        active: data.filter((d) => d.status === 'IN_PROGRESS').length,
      });
    } catch (err) {
      console.error('Failed to load drafts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const STAT_CARDS = [
    { label: 'Total drafts', value: stats.totalDrafts, color: '#1A1814' },
    { label: 'Completed games', value: stats.completed, color: '#2D6A2D' },
    { label: 'In progress', value: stats.active, color: '#096DD9' },
    { label: 'Server status', value: 'Online', color: '#2D6A2D' },
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
            onClick={fetchDrafts}
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

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,24,20,0.08)' }}
        >
          <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
            <h2 className="dz-heading text-lg font-semibold" style={{ color: '#1A1814' }}>Draft history</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm" style={{ color: '#8A8272' }}>Loading records…</div>
          ) : drafts.length === 0 ? (
            <div className="p-12 text-center text-sm" style={{ color: '#8A8272' }}>No drafts found in database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: 'rgba(26,24,20,0.03)' }}>
                    {['Date / time', 'Game mode', 'Status', 'Winner / score', ''].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}
                        style={{ color: '#8A8272' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((draft) => (
                    <tr key={draft._id} style={{ borderTop: '1px solid rgba(26,24,20,0.06)' }}>
                      <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>
                        <div>{formatDate(draft.createdAt)}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#A89E8E' }}>{draft._id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={
                            draft.gameMode === 'PvAI'
                              ? { color: '#531DAB', background: '#F9F0FF' }
                              : { color: '#096DD9', background: '#E6F7FF' }
                          }
                        >
                          {draft.gameMode || 'PVP'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {draft.status === 'COMPLETED' ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#2D6A2D', background: '#EBF5EB' }}>
                            Completed
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#C4570A', background: '#FEF0E6' }}>
                            In progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#1A1814' }}>
                        {draft.results ? (
                          <div>
                            <span className="font-semibold">{draft.results.winner}</span>
                            <div className="text-xs mt-0.5" style={{ color: '#A89E8E' }}>
                              {draft.results.score1} - {draft.results.score2}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#A89E8E' }}>—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(draft._id)}
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
      </div>
    </div>
  );
};

export default AdminPanel;
