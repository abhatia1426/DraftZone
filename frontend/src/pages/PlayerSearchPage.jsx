import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PlayerCard from "../components/PlayerCard";
import PlayerDetails from "../components/PlayerDetail";
import players from "../data/players";

export default function PlayerSearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const filtered = players.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.team.toLowerCase().includes(query.toLowerCase());

    const matchesFilter = filter === "All" || p.position === filter;

    return matchesQuery && matchesFilter;
  });

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#0a0f1f] via-[#0b1023] to-[#0a0f1f]">
      <div className="max-w-5xl mx-auto">

        {!selectedPlayer && (
          <>
            <h1 className="text-center text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Fantasy Search
            </h1>
            <p className="text-center text-slate-400 mt-2">
              Find and analyze your fantasy players
            </p>
            <div className="mt-10">
              <SearchBar 
                query={query} 
                setQuery={setQuery} 
                filter={filter} 
                setFilter={setFilter} 
              />
            </div>
          </>
        )}

        {selectedPlayer ? (
          <PlayerDetails player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />
        ) : (
          <div className="space-y-6 mt-8">
            {filtered.map((p) => (
              <PlayerCard key={p.id} player={p} onClick={() => setSelectedPlayer(p)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
