import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDrafts: 0,
    completed: 0,
    active: 0
  });

  // Fetch drafts on load
  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/drafts');
      const data = res.data;
      setDrafts(data);

      // Calculate simple stats
      setStats({
        totalDrafts: data.length,
        completed: data.filter(d => d.status === 'COMPLETED').length,
        active: data.filter(d => d.status === 'IN_PROGRESS').length
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to load drafts", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this draft?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/drafts/${id}`);
      
      // FIX: Don't just filter locally. Re-fetch from the DB to be sure.
      // This ensures the UI is 100% in sync with Mongo.
      await fetchDrafts(); 
      
    } catch (err) {
      alert("Error deleting draft");
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center">
      <div className="max-w-6xl w-full">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-red-500">Admin Dashboard</h1>
            <button onClick={fetchDrafts} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm">
                Refresh Data
            </button>
        </div>

        {/* --- STATS SECTION --- */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8 shadow-xl">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-700 p-4 rounded text-center">
              <div className="text-3xl font-bold">{stats.totalDrafts}</div>
              <div className="text-gray-400 text-sm">Total Drafts DB</div>
            </div>
            <div className="bg-slate-700 p-4 rounded text-center">
              <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-gray-400 text-sm">Completed Games</div>
            </div>
            <div className="bg-slate-700 p-4 rounded text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.active}</div>
              <div className="text-gray-400 text-sm">In Progress</div>
            </div>
            <div className="bg-slate-700 p-4 rounded text-center">
              <div className="text-3xl font-bold text-purple-400">Online</div>
              <div className="text-gray-400 text-sm">Server Status</div>
            </div>
          </div>
        </div>

        {/* --- DRAFTS TABLE --- */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">Draft History</h3>
            </div>
            
            {loading ? (
                <div className="p-8 text-center text-gray-400">Loading records...</div>
            ) : drafts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic">No drafts found in database.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">Date / Time</th>
                                <th className="p-4">Game Mode</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Winner / Score</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {drafts.map((draft) => (
                                <tr key={draft._id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 text-sm font-mono text-gray-300">
                                        <div>{formatDate(draft.createdAt)}</div>
                                        <div className="text-[10px] text-gray-500">{draft._id}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            draft.gameMode === 'PvAI' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                                        }`}>
                                            {draft.gameMode || 'PVP'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {draft.status === 'COMPLETED' ? (
                                            <span className="text-green-400 text-xs font-bold border border-green-400/30 px-2 py-1 rounded">COMPLETED</span>
                                        ) : (
                                            <span className="text-yellow-400 text-xs font-bold border border-yellow-400/30 px-2 py-1 rounded">IN PROGRESS</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {draft.results ? (
                                            <div>
                                                <span className="font-bold text-white">{draft.results.winner}</span>
                                                <div className="text-gray-500 text-xs">
                                                    {draft.results.score1} - {draft.results.score2}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">--</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(draft._id)}
                                            className="text-red-400 hover:text-white hover:bg-red-600 px-3 py-2 rounded transition-all text-xs font-bold border border-red-900 hover:border-red-500"
                                        >
                                            DELETE
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