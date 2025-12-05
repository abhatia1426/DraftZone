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
      const res = await fetch("http://localhost:4000/api/odds");
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
    <div className="min-h-screen w-full bg-[#0f1f33] text-white">

      {/* NAVBAR */}
      <nav className="bg-[#0f1f33]/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-[#1DB954]/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <img
              src={DraftLogo}
              className="h-12 w-12 rounded-full border border-[#1DB954]"
              alt="Fantasy Football Logo"
            />
            <span className="text-2xl font-bold tracking-wide text-[#1DB954]">
              DraftZone
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex gap-8 text-gray-300 text-lg">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/player-search" className="hover:text-white">Players</Link>
            <a className="hover:text-white">Rankings</a>
            <a className="hover:text-white">Draft</a>
            <Link to="/odds" className="hover:text-white">Odds</Link>
            <a className="hover:text-white">FAQ</a>
          </div>

        </div>
      </nav>
      <div className="pt-32 px-10">

        <h1 className="text-4xl font-bold mb-6 text-[#1DB954]">
          Live NFL Betting Odds
        </h1>

        {loading && (
          <p className="text-gray-400 text-xl animate-pulse">Loading odds...</p>
        )}

        {!loading && games.length === 0 && (
          <p className="text-gray-400">No odds available right now.</p>
        )}

        {!loading && games.length > 0 && (
          <div className="space-y-10">

            {games.map((game, index) => {
              const markets = game.bookmakers?.[0]?.markets || [];
              const moneyline = markets.find(m => m.key === "h2h");
              const spreads = markets.find(m => m.key === "spreads");
              const totals = markets.find(m => m.key === "totals");

              return (
                <div
                  key={index}
                  className="p-6 bg-[#16233b] rounded-2xl border border-[#1DB954]/40"
                >

                  {/* TEAM LOGOS + TITLE */}
                  <h2 className="text-2xl mb-4 font-semibold flex items-center gap-4">
                    <img src={TEAM_LOGOS[game.away_team]} className="h-10 w-10 rounded-full border border-[#1DB954]/60" />
                    {game.away_team}
                    <span className="text-gray-400 mx-2">@</span>
                    <img src={TEAM_LOGOS[game.home_team]} className="h-10 w-10 rounded-full border border-[#1DB954]/60" />
                    {game.home_team}
                  </h2>

                  <div className="space-y-6">

                    {/* MONEYLINE */}
                    {moneyline && (
                      <div>
                        <p className="text-gray-300 font-semibold mb-1">Moneyline</p>
                        {moneyline.outcomes.map((team, idx) => (
                          <div
                            key={idx}
                            className="bg-[#1DB954]/20 p-3 rounded-xl mb-2 flex justify-between"
                          >
                            <span>{team.name}: {team.price}</span>
                            <span className="text-sm text-gray-300">
                              Win %: {calcWinProb(team.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SPREADS */}
                    {spreads && (
                      <div>
                        <p className="text-gray-300 font-semibold mb-1">Point Spread</p>
                        {spreads.outcomes.map((team, idx) => (
                          <div
                            key={idx}
                            className="bg-[#1DB954]/20 p-3 rounded-xl mb-2 flex justify-between"
                          >
                            <span>
                              {team.name}: {team.point > 0 ? "+" : ""}{team.point} ({team.price})
                            </span>
                            <span className="text-sm text-gray-300">
                              Win %: {calcWinProb(team.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TOTALS */}
                    {totals && (
                      <div>
                        <p className="text-gray-300 font-semibold mb-1">Totals (Over/Under)</p>
                        {totals.outcomes.map((line, idx) => (
                          <div
                            key={idx}
                            className="bg-[#1DB954]/20 p-3 rounded-xl mb-2 flex justify-between"
                          >
                            <span>{line.name} {line.point} ({line.price})</span>
                            <span className="text-sm text-gray-300">
                              Win %: {calcWinProb(line.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

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