import { Search, X } from "lucide-react";

export default function SearchBar({ query, setQuery, filter, setFilter }) {
  return (
    <>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-center bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <Search className="w-5 h-5 text-slate-400 ml-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players, teams..."
            className="flex-1 bg-transparent px-4 py-4 text-white placeholder-slate-500 focus:outline-none text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-2 mr-3 hover:bg-slate-700/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        {["All", "QB", "RB", "WR", "TE"].map((pos) => (
          <button
            key={pos}
            onClick={() => setFilter(pos)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              filter === pos
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 border border-slate-700/50"
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
    </>
  );
}
