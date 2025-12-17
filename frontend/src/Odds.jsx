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

const calcWinProb = (price) => {
  if (!price) return "-";
  const decimal = price > 0 ? (100 / (price + 100)) * 100 : (Math.abs(price) / (Math.abs(price) + 100)) * 100;
  return decimal.toFixed(1) + "%";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1628] via-[#0f1f33] to-[#0a1628] text-white relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* NAVBAR */}
      <nav className="bg-transparent fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={DraftLogo}
              className="h-12 w-12 rounded-full ring-2 ring-[#1DB954]/30"
              alt="Fantasy Football Logo"
            />
            <span className="text-2xl font-bold tracking-wide">
              <span className="text-white">DRAFT</span>
              <span className="text-[#1DB954]">ZONE</span>
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-gray-400 text-sm font-semibold tracking-wider">
            <Link to="/" className="hover:text-[#1DB954] transition-colors">
              HOME
            </Link>
            <Link to="/player-search" className="hover:text-[#1DB954] transition-colors">
              PLAYERS
            </Link>
            <a className="hover:text-[#1DB954] transition-colors cursor-pointer">
              DRAFT
            </a>
            <Link to="/odds" className="text-[#1DB954]">
              ODDS
            </Link>
            <Link to="/login" className="hover:text-[#1DB954] transition-colors">
              LOGIN & SIGNUP
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 md:px-10 max-w-7xl mx-auto pb-20 relative z-10">

        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-[#1DB954]/20 rounded-full text-[#1DB954] text-sm font-bold border border-[#1DB954]/30">
              🔴 LIVE
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-[#1DB954] to-white bg-clip-text text-transparent">
            NFL Betting Odds
          </h1>
          <p className="text-gray-400 text-xl">Real-time odds from top sportsbooks</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-[#1DB954]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#1DB954] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400 text-xl animate-pulse">Loading live odds...</p>
          </div>
        )}

        {!loading && games.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#1DB954]/10 mb-6 border border-[#1DB954]/30">
              <svg className="w-12 h-12 text-[#1DB954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-300 text-2xl font-bold mb-2">No odds available right now</p>
            <p className="text-gray-500 text-lg">Check back soon for upcoming games!</p>
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
                  className="group relative overflow-hidden"
                >
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1DB954]/0 via-[#1DB954]/50 to-[#1DB954]/0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-[#111318]/90 to-[#16233b]/90 backdrop-blur-xl p-8 rounded-3xl border border-[#1DB954]/20 hover:border-[#1DB954]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#1DB954]/30 hover:-translate-y-2">
                    
                    {/* TEAM MATCHUP - Enhanced */}
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#1DB954]/20">
                      
                      {/* Away Team */}
                      <div className="flex items-center gap-6 flex-1">
                        <div className="relative group/logo">
                          <div className="absolute inset-0 bg-[#1DB954] blur-2xl opacity-30 group-hover/logo:opacity-50 transition-opacity"></div>
                          <img 
                            src={TEAM_LOGOS[game.away_team]} 
                            className="relative h-20 w-20 rounded-2xl border-2 border-[#1DB954]/50 bg-gradient-to-br from-white/10 to-white/5 p-3 backdrop-blur-sm shadow-xl transition-transform group-hover/logo:scale-110" 
                            alt={game.away_team}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[#1DB954] font-bold uppercase tracking-wider mb-2">Away</p>
                          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">{game.away_team}</h3>
                        </div>
                      </div>

                      {/* VS Badge - Enhanced */}
                      <div className="relative mx-8">
                        <div className="absolute inset-0 bg-[#1DB954] blur-xl opacity-30"></div>
                        <div className="relative flex items-center gap-4 px-8 py-4 bg-gradient-to-br from-[#1DB954]/20 to-[#1DB954]/10 rounded-2xl border-2 border-[#1DB954]/50 backdrop-blur-sm">
                          <span className="text-3xl font-black text-[#1DB954]">VS</span>
                        </div>
                      </div>

                      {/* Home Team */}
                      <div className="flex items-center gap-6 flex-row-reverse flex-1">
                        <div className="relative group/logo">
                          <div className="absolute inset-0 bg-[#1DB954] blur-2xl opacity-30 group-hover/logo:opacity-50 transition-opacity"></div>
                          <img 
                            src={TEAM_LOGOS[game.home_team]} 
                            className="relative h-20 w-20 rounded-2xl border-2 border-[#1DB954]/50 bg-gradient-to-br from-white/10 to-white/5 p-3 backdrop-blur-sm shadow-xl transition-transform group-hover/logo:scale-110" 
                            alt={game.home_team}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-xs text-[#1DB954] font-bold uppercase tracking-wider mb-2">Home</p>
                          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">{game.home_team}</h3>
                        </div>
                      </div>
                    </div>

                    {/* BETTING MARKETS - Enhanced */}
                    <div className="grid md:grid-cols-3 gap-6">

                      {/* MONEYLINE */}
                      {moneyline && (
                        <div className="relative group/card">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                          <div className="relative bg-gradient-to-br from-[#0f1f33]/80 to-[#16233b]/80 p-6 rounded-2xl border border-[#1DB954]/30 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-3 h-3 rounded-full bg-[#1DB954] shadow-lg shadow-[#1DB954]/50"></div>
                              <p className="text-white font-black text-xl tracking-wide">MONEYLINE</p>
                            </div>
                            {moneyline.outcomes.map((team, idx) => (
                              <div
                                key={idx}
                                className="group/bet bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/5 hover:from-[#1DB954]/20 hover:to-[#1DB954]/10 p-5 rounded-xl mb-3 last:mb-0 transition-all duration-300 cursor-pointer border border-[#1DB954]/30 hover:border-[#1DB954]/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#1DB954]/20"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-white text-lg">{team.name}</span>
                                  <span className="text-3xl font-black text-[#1DB954]">
                                    {team.price > 0 ? '+' : ''}{team.price}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Win Probability</span>
                                  <span className="font-bold text-[#1DB954]">{calcWinProb(team.price)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SPREADS */}
                      {spreads && (
                        <div className="relative group/card">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                          <div className="relative bg-gradient-to-br from-[#0f1f33]/80 to-[#16233b]/80 p-6 rounded-2xl border border-[#1DB954]/30 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-3 h-3 rounded-full bg-[#1DB954] shadow-lg shadow-[#1DB954]/50"></div>
                              <p className="text-white font-black text-xl tracking-wide">SPREAD</p>
                            </div>
                            {spreads.outcomes.map((team, idx) => (
                              <div
                                key={idx}
                                className="group/bet bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/5 hover:from-[#1DB954]/20 hover:to-[#1DB954]/10 p-5 rounded-xl mb-3 last:mb-0 transition-all duration-300 cursor-pointer border border-[#1DB954]/30 hover:border-[#1DB954]/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#1DB954]/20"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-white text-lg">{team.name}</span>
                                  <div className="text-right">
                                    <span className="text-3xl font-black text-[#1DB954]">
                                      {team.point > 0 ? "+" : ""}{team.point}
                                    </span>
                                    <span className="text-sm text-gray-400 ml-2">({team.price})</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Win Probability</span>
                                  <span className="font-bold text-[#1DB954]">{calcWinProb(team.price)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TOTALS */}
                      {totals && (
                        <div className="relative group/card">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                          <div className="relative bg-gradient-to-br from-[#0f1f33]/80 to-[#16233b]/80 p-6 rounded-2xl border border-[#1DB954]/30 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-3 h-3 rounded-full bg-[#1DB954] shadow-lg shadow-[#1DB954]/50"></div>
                              <p className="text-white font-black text-xl tracking-wide">OVER/UNDER</p>
                            </div>
                            {totals.outcomes.map((line, idx) => (
                              <div
                                key={idx}
                                className="group/bet bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/5 hover:from-[#1DB954]/20 hover:to-[#1DB954]/10 p-5 rounded-xl mb-3 last:mb-0 transition-all duration-300 cursor-pointer border border-[#1DB954]/30 hover:border-[#1DB954]/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#1DB954]/20"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-white text-lg">{line.name}</span>
                                  <div className="text-right">
                                    <span className="text-3xl font-black text-[#1DB954]">{line.point}</span>
                                    <span className="text-sm text-gray-400 ml-2">({line.price})</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Win Probability</span>
                                  <span className="font-bold text-[#1DB954]">{calcWinProb(line.price)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
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