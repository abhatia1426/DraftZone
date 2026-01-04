import { useState, useEffect } from "react";

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
  const [selectedBet, setSelectedBet] = useState(null);
  const [betAmount, setBetAmount] = useState(100);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [userBalance, setUserBalance] = useState(1000);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const userId = "678f6f2b8e7a3c001f4d5e9a"; // Replace with actual user ID from auth

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

  const fetchUserBalance = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/bets/stats/${userId}`);
      const data = await res.json();
      setUserBalance(data.balance);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  useEffect(() => {
    fetchOdds();
    fetchUserBalance();
  }, []);

  const calculatePayout = (odds, stake) => {
    if (!odds || !stake) return 0;
    if (odds > 0) {
      return stake + (stake * (odds / 100));
    } else {
      return stake + (stake / (Math.abs(odds) / 100));
    }
  };

  const handleBetClick = (betData) => {
    setSelectedBet(betData);
    setShowBetSlip(true);
    setBetAmount(100);
  };

  const placeBet = async () => {
    if (!selectedBet || betAmount <= 0) return;
    
    if (betAmount > userBalance) {
      alert(`Insufficient balance! You have $${userBalance.toFixed(2)}`);
      return;
    }

    setIsPlacingBet(true);

    try {
      const response = await fetch('http://localhost:8080/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          gameId: selectedBet.gameId,
          awayTeam: selectedBet.awayTeam,
          homeTeam: selectedBet.homeTeam,
          teamName: selectedBet.teamName,
          betType: selectedBet.betType,
          odds: selectedBet.odds,
          amount: betAmount
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUserBalance(data.newBalance);
        alert(`✅ Bet placed successfully!\n\nBet: ${selectedBet.betType} on ${selectedBet.teamName}\nAmount: $${betAmount}\nPotential Win: $${(calculatePayout(selectedBet.odds, betAmount) - betAmount).toFixed(2)}\n\nNew Balance: $${data.newBalance.toFixed(2)}`);
        setShowBetSlip(false);
        setSelectedBet(null);
        setBetAmount(100);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error('Error placing bet:', err);
      alert('Failed to place bet. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20" />
      </div>

      <nav className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50 border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-2xl">🏈</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-white">DRAFT</span>
              <span className="text-green-500">ZONE</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
              <span className="text-gray-400 text-sm mr-2">Balance:</span>
              <span className="text-green-500 font-bold text-lg">${userBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-green-500/20 rounded-full text-green-500 text-sm font-bold border border-green-500/30">
              🔴 LIVE
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-green-500 to-white bg-clip-text text-transparent">
            NFL Betting Odds
          </h1>
          <p className="text-gray-400 text-xl">Click any bet to place your wager</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-xl">Loading odds...</p>
          </div>
        )}

        {!loading && games.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-300 text-2xl font-bold mb-2">No odds available</p>
            <p className="text-gray-500 text-lg">Check back soon for upcoming games!</p>
          </div>
        )}

        {!loading && games.length > 0 && (
          <div className="grid gap-8">
            {games.map((game, index) => {
              const markets = game.bookmakers?.[0]?.markets || [];
              const moneyline = markets.find(m => m.key === "h2h");
              const spreads = markets.find(m => m.key === "spreads");
              const totals = markets.find(m => m.key === "totals");

              return (
                <div key={index} className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-green-500/20 hover:border-green-500/50 transition-all">
                  
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-green-500/20">
                    
                    <div className="flex items-center gap-6 flex-1">
                      <img 
                        src={TEAM_LOGOS[game.away_team]} 
                        className="h-20 w-20 rounded-2xl border-2 border-green-500/50 bg-slate-700/50 p-3" 
                        alt={game.away_team}
                      />
                      <div>
                        <p className="text-xs text-green-500 font-bold uppercase mb-2">Away</p>
                        <h3 className="text-2xl md:text-3xl font-black text-white">{game.away_team}</h3>
                      </div>
                    </div>

                    <div className="mx-8 px-8 py-4 bg-green-500/20 rounded-2xl border-2 border-green-500/50">
                      <span className="text-3xl font-black text-green-500">VS</span>
                    </div>

                    <div className="flex items-center gap-6 flex-row-reverse flex-1">
                      <img 
                        src={TEAM_LOGOS[game.home_team]} 
                        className="h-20 w-20 rounded-2xl border-2 border-green-500/50 bg-slate-700/50 p-3" 
                        alt={game.home_team}
                      />
                      <div className="text-right">
                        <p className="text-xs text-green-500 font-bold uppercase mb-2">Home</p>
                        <h3 className="text-2xl md:text-3xl font-black text-white">{game.home_team}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">

                    {moneyline && (
                      <div className="bg-slate-700/50 p-6 rounded-2xl border border-green-500/30">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <p className="text-white font-black text-xl">MONEYLINE</p>
                        </div>
                        {moneyline.outcomes.map((team, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleBetClick({
                              gameId: game.id,
                              teamName: team.name,
                              betType: 'MONEYLINE',
                              odds: team.price,
                              awayTeam: game.away_team,
                              homeTeam: game.home_team
                            })}
                            className="bg-green-500/10 hover:bg-green-500/20 p-5 rounded-xl mb-3 last:mb-0 transition-all cursor-pointer border border-green-500/30 hover:border-green-500/60"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-white text-lg">{team.name}</span>
                              <span className="text-3xl font-black text-green-500">
                                {team.price > 0 ? '+' : ''}{team.price}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Win Probability</span>
                              <span className="font-bold text-green-500">{calcWinProb(team.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {spreads && (
                      <div className="bg-slate-700/50 p-6 rounded-2xl border border-green-500/30">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <p className="text-white font-black text-xl">SPREAD</p>
                        </div>
                        {spreads.outcomes.map((team, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleBetClick({
                              gameId: game.id,
                              teamName: team.name,
                              betType: `SPREAD ${team.point > 0 ? '+' : ''}${team.point}`,
                              odds: team.price,
                              spread: team.point,
                              awayTeam: game.away_team,
                              homeTeam: game.home_team
                            })}
                            className="bg-green-500/10 hover:bg-green-500/20 p-5 rounded-xl mb-3 last:mb-0 transition-all cursor-pointer border border-green-500/30 hover:border-green-500/60"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-white text-lg">{team.name}</span>
                              <div className="text-right">
                                <span className="text-3xl font-black text-green-500">
                                  {team.point > 0 ? "+" : ""}{team.point}
                                </span>
                                <span className="text-sm text-gray-400 ml-2">({team.price})</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Win Probability</span>
                              <span className="font-bold text-green-500">{calcWinProb(team.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {totals && (
                      <div className="bg-slate-700/50 p-6 rounded-2xl border border-green-500/30">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <p className="text-white font-black text-xl">OVER/UNDER</p>
                        </div>
                        {totals.outcomes.map((line, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleBetClick({
                              gameId: game.id,
                              teamName: line.name,
                              betType: `${line.name} ${line.point}`,
                              odds: line.price,
                              total: line.point,
                              awayTeam: game.away_team,
                              homeTeam: game.home_team
                            })}
                            className="bg-green-500/10 hover:bg-green-500/20 p-5 rounded-xl mb-3 last:mb-0 transition-all cursor-pointer border border-green-500/30 hover:border-green-500/60"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-white text-lg">{line.name}</span>
                              <div className="text-right">
                                <span className="text-3xl font-black text-green-500">{line.point}</span>
                                <span className="text-sm text-gray-400 ml-2">({line.price})</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Win Probability</span>
                              <span className="font-bold text-green-500">{calcWinProb(line.price)}</span>
                            </div>
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

      {showBetSlip && selectedBet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border-2 border-green-500/50 p-8 max-w-lg w-full">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-white mb-2">Place Your Bet</h2>
                <p className="text-gray-400">Review and confirm your wager</p>
              </div>
              <button
                onClick={() => {
                  setShowBetSlip(false);
                  setSelectedBet(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-green-500/30">
              <div className="text-center mb-4">
                <p className="text-gray-400 text-sm mb-2">MATCHUP</p>
                <p className="text-white font-bold text-xl">
                  {selectedBet.awayTeam} @ {selectedBet.homeTeam}
                </p>
              </div>
              
              <div className="h-px bg-green-500/30 mb-4"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">BET TYPE</p>
                  <p className="text-white font-bold">{selectedBet.betType}</p>
                  <p className="text-gray-400 text-sm mt-1">{selectedBet.teamName}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">ODDS</p>
                  <p className="text-green-500 font-bold text-2xl">
                    {selectedBet.odds > 0 ? '+' : ''}{selectedBet.odds}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-white font-bold mb-3 block">Bet Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-2xl font-bold">$</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/50 border-2 border-green-500/30 focus:border-green-500 rounded-xl px-4 pl-10 py-4 text-white text-2xl font-bold outline-none"
                  min="1"
                  step="1"
                />
              </div>
              
              <div className="flex gap-2 mt-3">
                {[25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg py-2 text-green-500 font-bold transition-all"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-green-500/20 rounded-2xl p-6 mb-6 border-2 border-green-500/50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300 text-sm mb-1">TO WIN</p>
                  <p className="text-green-500 font-black text-4xl">
                    ${(calculatePayout(selectedBet.odds, betAmount) - betAmount).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm mb-1">TOTAL PAYOUT</p>
                  <p className="text-white font-bold text-2xl">
                    ${calculatePayout(selectedBet.odds, betAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowBetSlip(false);
                  setSelectedBet(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={placeBet}
                disabled={betAmount <= 0 || isPlacingBet}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingBet ? 'Placing...' : 'Place Bet'}
              </button>
            </div>

            <p className="text-gray-500 text-xs text-center mt-4">
              Must be 21+ and in eligible state. Gambling Problem? Call 1-800-GAMBLER
            </p>

          </div>
        </div>
      )}
    </div>
  );
}