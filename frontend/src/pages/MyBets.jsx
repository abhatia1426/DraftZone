import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DraftLogo from "../assets/FFLogo.jpeg";

export default function MyBets() {
    const [activeTab, setactiveTab] = useState("pending");
    const [pendingBets, setPendingBets] = useState([]);
    const [betHistory, setBetHistory] = useState([]);
    const [userStats, setUserStats] = useState({ balance: 0, totalWagered: 0, totalWon: 0});
    const [loading, setLoading] = useState(true);


const userId = "6943417c55cff8664e9762d3"; 

useEffect(() => {
    fetchBets();
}, []);

const fetchBets = async () => {
    setLoading(true);
    try {
        const statsRes = await fetch(`http://localhost:8080/api/bets/stats/${userId}`);
        const statsData = await statsRes.json();
        setUserStats(statsData);

        const pendingRes = await fetch(`http://localhost:8080/api/bets/pending/${userId}`);
        const pendingData = await pendingRes.json();
        setPendingBets(pendingData);

        const historyRes = await fetch(`http://localhost:8080/api/bets/user/${userId}`);
        const historyData = await historyRes.json();
        setBetHistory(historyData.filter(bet => bet.status !== "pending"));
    } catch (error) {
        console.error("Error fetching bets: ", error);
    }
    setLoading(false);
};

const getStatusColor = (status) => {
    switch(status) {
        case "won": return "text-green-500";
        case "lost" : return "text-red-500";
        case "pending" : return "text-yellow-500";
        default: return "text-gray-400";
    }
};

const getStatusIcon = (status) => {
    switch(status) {
        case "won": return "✔️";
        case "lost" : return "❌";
        case "pending" : return "⏳";
        default: return "❔";
    }
};

const calculateWinRate = () => {
    const wonBets = betHistory.filter(bet => bet.status === "won").length;
    const lostBets = betHistory.filter(bet => bet.status === "lost").length;
    const total = wonBets + lostBets;
    if(total === 0) return "0%";
    return `${((wonBets / total) * 100).toFixed(1)}%`;
};

return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

        <div className = "fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20" />
        </div>

        <nav className = "fixed top-0 left-0 right-0 z-50 bg-slate900/30 backdrop-blur-md border-b border-[#1DB954]20">
            <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                <Link to ="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className ="relative">
                        <img
                            src={DraftLogo}
                            className="h-12 w-12 rounded-full border-2 border-[#1DB954] group-hover:scale-110 transition-transform duration-300"
                            alt="Fantasy Football Logo"
                        />
                        <div className="absolute inset-0 rounded-full bg-[#1DB954] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">
                        DRAFT<span className="text-[#1DB954]">ZONE</span>
                    </span>
                </Link>

                <div className="flex gap-4 md:gap-8 text-xs md:text-sm font-bold uppercase tracking-wider">
                    <Link to="/" className="relative text-gray-400 hover:text-white transition-colors group">
                    Home
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1DB954] group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link to="/player-search" className="relative text-gray-400 hover:text-white transition-colors group">
                    Players
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1DB954] group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link to="/draft" className="relative text-gray-400 hover:text-white transition-colors group">
                    Draft
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1DB954] group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link to="/odds" className="relative text-gray-400 hover:text-white transition-colors group">
                    Odds
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1DB954] group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link to="/my-bets" className="relative text-white transition-colors group">
                    My Bets
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1DB954]" />
                    </Link>
                    <Link to="/login" className="relative text-gray-400 hover:text-white transition-colors group">
                    Login
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1DB954] group-hover:w-full transition-all duration-300" />
                    </Link>
                </div>

                <div className="px-4 py-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full">
                    <span className="text-gray-400 text-sm mr-2">Balance:</span>
                    <span className="text-[#1DB954] font-bold text-lg">${userStats.balance?.toFixed(2) || "0.00"}</span>
                </div>
            </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 relative z-10">
            <div className="mb-12 text-center">
                <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-green-500 to-white bg-clip-text text-transparent">
                    Bet Tracker
                </h1>
                <p className="text-gray-400 text-xl">Track your wagers and winnings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-green-500/20">
                    <p className="text-gray-400 text-sm mb-2">Current Balance</p>
                    <p className="text-4xl font-black text-green-500">${userStats.balance?.toFixed(2) || "0.00"}</p>
                </div>
          
                <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-green-500/20">
                    <p className="text-gray-400 text-sm mb-2">Total Wagered</p>
                    <p className="text-4xl font-black text-white">${userStats.totalWagered?.toFixed(2) || "0.00"}</p>
                </div>
          
                <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-green-500/20">
                    <p className="text-gray-400 text-sm mb-2">Total Won</p>
                    <p className="text-4xl font-black text-green-500">${userStats.totalWon?.toFixed(2) || "0.00"}</p>
                </div>
          
                <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-green-500/20">
                    <p className="text-gray-400 text-sm mb-2">Win Rate</p>
                    <p className="text-4xl font-black text-white">{calculateWinRate()}</p>
                    <p className="text-sm text-gray-400 mt-1">
                    {betHistory.filter(b => b.status === "won").length}W - {betHistory.filter(b => b.status === "lost").length}L
                    </p>
                </div>
             </div>

             <div className="flex gap-4 mb-8 border-b border-green-500/20">
                <button
                    onClick={() => setactiveTab("pending")}
                    className={`px-6 py-3 font-bold transitionall ${
                        activeTab === "pending"
                         ? "text-green-500 border-b-2 border-green-500"
                         : "text-gray-400 hover:text-white"
                    }`}
                >
                    Pending Bets ({pendingBets.length})
                </button>
                <button 
                    onClick={() => setactiveTab("history")}
                    className={`px-7 py-3 font-bold transition-all ${
                        activeTab === "history"
                         ? "text-green-500 border-b-2 border-green-500"
                         : "text-gray-400 hover:text-white"
                    }`}
                >
                    Bet History ({betHistory.length})
                </button>
             </div>

             {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 text-xl">Loading Bets ...</p>
                </div>
             )}

             {/* Pending Bets */}
            {!loading && activeTab === "pending" && (
            <div className="space-y-6">
                {pendingBets.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 mb-6 border border-green-500/30">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    </div>
                    <p className="text-gray-300 text-2xl font-bold mb-2">No pending bets</p>
                    <p className="text-gray-500 text-lg mb-6">Place your first bet to get started!</p>
                    <Link
                    to="/odds"
                    className="inline-block px-8 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-600 transition-all"
                    >
                    View Odds
                    </Link>
                </div>
                ) : (
                pendingBets.map((bet) => (
                    <div
                    key={bet._id}
                    className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-green-500/20 hover:border-green-500/50 transition-all"
                    >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getStatusIcon(bet.status)}</span>
                            <h3 className="text-2xl font-bold text-white">{bet.awayTeam} @ {bet.homeTeam}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full font-bold">
                            {bet.betType}
                            </span>
                            <span className="text-gray-400">on {bet.teamName}</span>
                        </div>
                        </div>
                        <div className="text-right">
                        <p className={`text-3xl font-black ${getStatusColor(bet.status)}`}>
                            {bet.odds > 0 ? '+' : ''}{bet.odds}
                        </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-green-500/20">
                        <div>
                        <p className="text-gray-400 text-sm mb-1">Wagered</p>
                        <p className="text-xl font-bold text-white">${bet.amount.toFixed(2)}</p>
                        </div>
                        <div>
                        <p className="text-gray-400 text-sm mb-1">To Win</p>
                        <p className="text-xl font-bold text-green-500">${bet.profit.toFixed(2)}</p>
                        </div>
                        <div>
                        <p className="text-gray-400 text-sm mb-1">Total Payout</p>
                        <p className="text-xl font-bold text-white">${bet.potentialPayout.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-500/20">
                        <p className="text-gray-400 text-sm">
                        Placed on {new Date(bet.placedAt).toLocaleDateString()} at {new Date(bet.placedAt).toLocaleTimeString()}
                        </p>
                    </div>
                    </div>
                    ))
                )}
            </div>
            )}
            {!loading && activeTab === "history" && (
          <div className="space-y-6">
            {betHistory.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-300 text-2xl font-bold mb-2">No bet history yet</p>
                <p className="text-gray-500 text-lg">Your completed bets will appear here</p>
              </div>
            ) : (
              betHistory.map((bet) => (
                <div
                  key={bet._id}
                  className={`bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border transition-all ${
                    bet.status === "won"
                      ? "border-green-500/40 hover:border-green-500/60"
                      : "border-red-500/40 hover:border-red-500/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getStatusIcon(bet.status)}</span>
                        <h3 className="text-2xl font-bold text-white">{bet.awayTeam} @ {bet.homeTeam}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          bet.status === "won" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                        }`}>
                          {bet.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-slate-700 text-white rounded-full font-bold">
                          {bet.betType}
                        </span>
                        <span className="text-gray-400">on {bet.teamName}</span>
                        <span className="text-gray-400">
                          {bet.odds > 0 ? '+' : ''}{bet.odds}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm mb-1">
                        {bet.status === "won" ? "Won" : "Lost"}
                      </p>
                      <p className={`text-3xl font-black ${
                        bet.status === "won" ? "text-green-500" : "text-red-500"
                      }`}>
                        {bet.status === "won" ? '+' : '-'}${Math.abs(bet.status === "won" ? bet.profit : bet.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Wagered</p>
                      <p className="text-xl font-bold text-white">${bet.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        {bet.status === "won" ? "Won" : "Lost"}
                      </p>
                      <p className={`text-xl font-bold ${bet.status === "won" ? "text-green-500" : "text-red-500"}`}>
                        ${bet.status === "won" ? bet.profit.toFixed(2) : bet.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Payout</p>
                      <p className="text-xl font-bold text-white">
                        ${bet.status === "won" ? bet.potentialPayout.toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                    <p className="text-gray-400 text-sm">
                      Placed: {new Date(bet.placedAt).toLocaleDateString()}
                    </p>
                    {bet.settledAt && (
                      <p className="text-gray-400 text-sm">
                        Settled: {new Date(bet.settledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        </div>
    </div>
);
}