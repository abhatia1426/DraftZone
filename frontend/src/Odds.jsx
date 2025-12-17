import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DraftLogo from "./assets/FFLogo.jpeg";

const TEAM_LOGOS = {
  "Arizona Cardinals": "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png",
  "Atlanta Falcons": "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png",
  "Baltimore Ravens": "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",
  "Buffalo Bills": "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
  "Carolina Panthers": "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
  "Chicago Bears": "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
  "Cincinnati Bengals": "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png",
  "Cleveland Browns": "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png",
  "Dallas Cowboys": "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
  "Denver Broncos": "https://a.espncdn.com/i/teamlogos/nfl/500/den.png",
  "Detroit Lions": "https://a.espncdn.com/i/teamlogos/nfl/500/det.png",
  "Green Bay Packers": "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
  "Houston Texans": "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png",
  "Indianapolis Colts": "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png",
  "Jacksonville Jaguars": "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png",
  "Kansas City Chiefs": "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
  "Las Vegas Raiders": "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",
  "Los Angeles Chargers": "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",
  "Los Angeles Rams": "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
  "Miami Dolphins": "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png",
  "Minnesota Vikings": "https://a.espncdn.com/i/teamlogos/nfl/500/min.png",
  "New England Patriots": "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
  "New Orleans Saints": "https://a.espncdn.com/i/teamlogos/nfl/500/no.png",
  "New York Giants": "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",
  "New York Jets": "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png",
  "Philadelphia Eagles": "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
  "Pittsburgh Steelers": "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",
  "San Francisco 49ers": "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
  "Seattle Seahawks": "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png",
  "Tampa Bay Buccaneers": "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png",
  "Tennessee Titans": "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png",
  "Washington Commanders": "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png"
};

const calcWinProb = (decimal) => {
  if (!decimal || decimal <= 0) return "-";
  return (100 / decimal).toFixed(1) + "%";
};

export default function Odds() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOdds = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/odds");
      const data = await res.json();
      setGames(data);
    } catch (err) {
      console.error("Error fetching odds:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOdds();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1628] via-[#0f1f33] to-[#0a1628] text-white">

      {/* NAVBAR */}
      <nav className="bg-[#0d1f1a] fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <img
              src={DraftLogo}
              className="h-12 w-12 rounded-full"
              alt="Fantasy Football Logo"
            />
            <span className="text-2xl font-bold tracking-wide">
              <span className="text-white">DRAFT</span>
              <span className="text-[#1DB954]">ZONE</span>
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-gray-400 text-sm font-semibold tracking-wider">
            <Link to="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <Link to="/player-search" className="hover:text-white transition-colors">
              PLAYERS
            </Link>
            <a className="hover:text-white transition-colors cursor-pointer">
              DRAFT
            </a>
            <Link to="/odds" className="text-white">
              ODDS
            </Link>
            <a className="hover:text-white transition-colors cursor-pointer">
              LOGIN & SIGNUP
            </a>
          </div>

        </div>
      </nav>

      <div className="pt-32 px-6 md:px-10 max-w-7xl mx-auto pb-20">

        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-[#1DB954] via-[#1ed760] to-[#1DB954] bg-clip-text text-transparent animate-gradient">
            Live NFL Betting Odds
          </h1>
          <p className="text-gray-400 text-lg">Real-time odds from top sportsbooks</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-[#1DB954]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#1DB954] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400 text-xl animate-pulse">Loading live odds...</p>
          </div>
        )}

        {!loading && games.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1DB954]/10 mb-6">
              <svg className="w-10 h-10 text-[#1DB954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-xl">No odds available right now.</p>
            <p className="text-gray-500 mt-2">Check back soon for upcoming games!</p>
          </div>
        )}

        {!loading && games.length > 0 && (
          <div className="grid grid-cols-1 gap-8">

            {games.map((game, index) => {
              const markets = game.bookmakers?.[0]?.markets || [];
              const moneyline = markets.find(m => m.key === "h2h");
              const spreads = markets.find(m => m.key === "spreads");
              const totals = markets.find(m => m.key === "totals");

              return (
                <div
                  key={index}
                  className="group relative p-8 bg-gradient-to-br from-[#16233b] to-[#1a2942] rounded-3xl border border-[#1DB954]/30 hover:border-[#1DB954]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#1DB954]/20 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10">
                    {/* TEAM MATCHUP */}
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#1DB954] blur-lg opacity-20"></div>
                          <img 
                            src={TEAM_LOGOS[game.away_team]} 
                            className="relative h-16 w-16 rounded-xl border-2 border-[#1DB954]/40 bg-white/5 p-2 backdrop-blur-sm" 
                            alt={game.away_team}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Away</p>
                          <h3 className="text-2xl font-bold">{game.away_team}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-6 py-3 bg-[#1DB954]/10 rounded-full border border-[#1DB954]/30">
                        <span className="text-2xl font-black text-[#1DB954]">VS</span>
                      </div>

                      <div className="flex items-center gap-4 flex-row-reverse">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#1DB954] blur-lg opacity-20"></div>
                          <img 
                            src={TEAM_LOGOS[game.home_team]} 
                            className="relative h-16 w-16 rounded-xl border-2 border-[#1DB954]/40 bg-white/5 p-2 backdrop-blur-sm" 
                            alt={game.home_team}
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400 mb-1">Home</p>
                          <h3 className="text-2xl font-bold">{game.home_team}</h3>
                        </div>
                      </div>
                    </div>

                    {/* BETTING MARKETS */}
                    <div className="grid md:grid-cols-3 gap-6">

                      {/* MONEYLINE */}
                      {moneyline && (
                        <div className="bg-gradient-to-br from-[#0f1f33] to-[#16233b] p-6 rounded-2xl border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#1DB954]"></div>
                            <p className="text-gray-300 font-bold text-lg">Moneyline</p>
                          </div>
                          {moneyline.outcomes.map((team, idx) => (
                            <div
                              key={idx}
                              className="bg-[#1DB954]/10 hover:bg-[#1DB954]/20 p-4 rounded-xl mb-3 transition-all duration-200 cursor-pointer border border-[#1DB954]/20 hover:border-[#1DB954]/40"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-white">{team.name}</span>
                                <span className="text-2xl font-bold text-[#1DB954]">{team.price > 0 ? '+' : ''}{team.price}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Win Probability:</span>
                                <span className="font-semibold text-[#1DB954]">{calcWinProb(team.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SPREADS */}
                      {spreads && (
                        <div className="bg-gradient-to-br from-[#0f1f33] to-[#16233b] p-6 rounded-2xl border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#1DB954]"></div>
                            <p className="text-gray-300 font-bold text-lg">Point Spread</p>
                          </div>
                          {spreads.outcomes.map((team, idx) => (
                            <div
                              key={idx}
                              className="bg-[#1DB954]/10 hover:bg-[#1DB954]/20 p-4 rounded-xl mb-3 transition-all duration-200 cursor-pointer border border-[#1DB954]/20 hover:border-[#1DB954]/40"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-white">{team.name}</span>
                                <div className="text-right">
                                  <span className="text-2xl font-bold text-[#1DB954]">
                                    {team.point > 0 ? "+" : ""}{team.point}
                                  </span>
                                  <span className="text-sm text-gray-400 ml-2">({team.price})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Win Probability:</span>
                                <span className="font-semibold text-[#1DB954]">{calcWinProb(team.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TOTALS */}
                      {totals && (
                        <div className="bg-gradient-to-br from-[#0f1f33] to-[#16233b] p-6 rounded-2xl border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#1DB954]"></div>
                            <p className="text-gray-300 font-bold text-lg">Over/Under</p>
                          </div>
                          {totals.outcomes.map((line, idx) => (
                            <div
                              key={idx}
                              className="bg-[#1DB954]/10 hover:bg-[#1DB954]/20 p-4 rounded-xl mb-3 transition-all duration-200 cursor-pointer border border-[#1DB954]/20 hover:border-[#1DB954]/40"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-white">{line.name}</span>
                                <div className="text-right">
                                  <span className="text-2xl font-bold text-[#1DB954]">{line.point}</span>
                                  <span className="text-sm text-gray-400 ml-2">({line.price})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Win Probability:</span>
                                <span className="font-semibold text-[#1DB954]">{calcWinProb(line.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}