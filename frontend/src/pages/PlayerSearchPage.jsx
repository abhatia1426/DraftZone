import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PlayerCard from "../components/PlayerCard";
import PlayerDetails from "../components/PlayerDetail";
import players from "../data/players";

export default function PlayerSearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [sortBy, setSortBy] = useState("rank"); // rank, name, points

  const filtered = players.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.team.toLowerCase().includes(query.toLowerCase());

    const matchesFilter = filter === "All" || p.position === filter;

    return matchesQuery && matchesFilter;
  });

  // Sort players
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rank") return (a.rank || 999) - (b.rank || 999);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "points") return (b.projectedPoints || 0) - (a.projectedPoints || 0);
    return 0;
  });

  const positionCounts = {
    All: players.length,
    QB: players.filter(p => p.position === "QB").length,
    RB: players.filter(p => p.position === "RB").length,
    WR: players.filter(p => p.position === "WR").length,
    TE: players.filter(p => p.position === "TE").length,
    K: players.filter(p => p.position === "K").length,
    DST: players.filter(p => p.position === "DST").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1DB954] rounded-full blur-[150px] opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!selectedPlayer ? (
          <>
            {/* Header Section */}
            <div className="text-center mb-12 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full backdrop-blur-sm">
                <svg className="w-4 h-4 text-[#1DB954]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="text-[#1DB954] text-sm font-bold uppercase tracking-wider">Player Database</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Find Your Next
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#1DB954] to-[#17a84d] bg-clip-text text-transparent">
                  Fantasy Star
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Search through {players.length}+ NFL players with real-time stats and projections
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar 
                query={query} 
                setQuery={setQuery} 
                filter={filter} 
                setFilter={setFilter} 
              />
            </div>

            {/* Position Filter Pills */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {Object.keys(positionCounts).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setFilter(pos)}
                  className={`
                    group relative px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                    transition-all duration-300 hover:scale-105
                    ${filter === pos 
                      ? 'bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/50' 
                      : 'bg-[#1a1f35] text-gray-400 hover:text-white border border-gray-800 hover:border-[#1DB954]/50'
                    }
                  `}
                >
                  {pos}
                  <span className="ml-2 text-xs opacity-75">
                    ({positionCounts[pos]})
                  </span>
                  {filter !== pos && (
                    <div className="absolute inset-0 rounded-full bg-[#1DB954] opacity-0 group-hover:opacity-10 transition-opacity" />
                  )}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-sm font-semibold">
                  {sorted.length} {sorted.length === 1 ? 'Player' : 'Players'}
                </span>
                {query && (
                  <span className="text-xs bg-[#1DB954]/10 text-[#1DB954] px-2 py-1 rounded-full">
                    Filtered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1a1f35] text-white border border-gray-800 rounded-lg px-4 py-2 text-sm font-semibold hover:border-[#1DB954]/50 focus:outline-none focus:border-[#1DB954] transition-colors cursor-pointer"
                >
                  <option value="rank">Rank</option>
                  <option value="name">Name</option>
                  <option value="points">Projected Points</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sorted.map((p, index) => (
                  <div
                    key={p.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <PlayerCard player={p} onClick={() => setSelectedPlayer(p)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1a1f35] mb-6">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Players Found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setFilter("All");
                  }}
                  className="px-6 py-3 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#17a84d] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="animate-fade-in">
            <PlayerDetails 
              player={selectedPlayer} 
              onBack={() => setSelectedPlayer(null)} 
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}