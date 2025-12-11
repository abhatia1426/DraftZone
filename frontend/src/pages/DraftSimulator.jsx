import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';


const getPlayerImage = (player) => {
  if (!player) return "https://sleepercdn.com/images/v2/icons/player_default.webp";
  if (player.position === 'DEF' && player.team) {
    return `https://sleepercdn.com/images/team_logos/nfl/${player.team.toLowerCase()}.png`;
  }
  return `https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`;
};

const calculateScore = (roster) => {
  let total = 0;
  // Sum starters
  const starters = [roster.QB, roster.RB1, roster.RB2, roster.WR1, roster.WR2, roster.TE, roster.FLEX, roster.DST, roster.K];
  starters.forEach(p => {
    if (p && p.stats && p.stats.pts_ppr) total += p.stats.pts_ppr;
  });
  return total.toFixed(1);
};


const DraftRecap = ({ rosters, onRestart }) => {
  const score1 = calculateScore(rosters.user1);
  const score2 = calculateScore(rosters.user2);
  const winner = parseFloat(score1) >= parseFloat(score2) ? 'User 1' : 'User 2';

  const renderRecapRow = (label, p1, p2) => (
    <div className="grid grid-cols-3 gap-4 border-b border-gray-800 py-2 items-center hover:bg-gray-800/30 transition-colors">
    
      <div className={`flex items-center gap-2 ${!p1 ? 'opacity-50' : ''}`}>
        <img src={getPlayerImage(p1)} className="w-8 h-8 rounded-full border border-gray-600 object-cover" alt="" />
        <div className="overflow-hidden">
          <div className="text-sm font-bold text-white truncate w-24 md:w-32">{p1?.full_name || 'Empty'}</div>
          <div className="text-[10px] text-gray-500">{p1?.stats?.pts_ppr?.toFixed(1) || 0} PTS</div>
        </div>
      </div>

      
      <div className="text-center">
        <span className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-1 rounded border border-gray-700">
          {label}
        </span>
      </div>

      
      <div className="flex items-center gap-2 justify-end text-right">
        <div className="overflow-hidden">
          <div className="text-sm font-bold text-white truncate w-24 md:w-32">{p2?.full_name || 'Empty'}</div>
          <div className="text-[10px] text-gray-500">{p2?.stats?.pts_ppr?.toFixed(1) || 0} PTS</div>
        </div>
        <img src={getPlayerImage(p2)} className="w-8 h-8 rounded-full border border-gray-600 object-cover" alt="" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-4xl w-full bg-[#111318] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        
       
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black italic tracking-tighter mb-2">DRAFT COMPLETE!</h1>
            <p className="text-blue-200 font-mono text-sm">SEASON PROJECTION BASED ON 2025 STATS</p>
          </div>
        </div>

        
        <div className="flex justify-between items-center bg-black/50 p-6 border-b border-gray-800">
          <div className="text-center">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Team Human</div>
            <div className={`text-4xl font-black ${winner === 'User 1' ? 'text-green-400' : 'text-gray-400'}`}>
              {score1}
            </div>
            <div className="text-xs text-gray-600">Total Points</div>
          </div>

          <div className="text-2xl font-black text-gray-700">VS</div>

          <div className="text-center">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Team CPU</div>
            <div className={`text-4xl font-black ${winner === 'User 2' ? 'text-green-400' : 'text-gray-400'}`}>
              {score2}
            </div>
            <div className="text-xs text-gray-600">Total Points</div>
          </div>
        </div>

        
        <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
          {renderRecapRow('QB', rosters.user1.QB, rosters.user2.QB)}
          {renderRecapRow('RB', rosters.user1.RB1, rosters.user2.RB1)}
          {renderRecapRow('RB', rosters.user1.RB2, rosters.user2.RB2)}
          {renderRecapRow('WR', rosters.user1.WR1, rosters.user2.WR1)}
          {renderRecapRow('WR', rosters.user1.WR2, rosters.user2.WR2)}
          {renderRecapRow('TE', rosters.user1.TE, rosters.user2.TE)}
          {renderRecapRow('FLX', rosters.user1.FLEX, rosters.user2.FLEX)}
          {renderRecapRow('DEF', rosters.user1.DST, rosters.user2.DST)}
          {renderRecapRow('K', rosters.user1.K, rosters.user2.K)}
          
          <div className="my-4 border-t border-gray-800"></div>
          <div className="text-center text-xs text-gray-500 uppercase font-bold mb-2">Bench Players</div>
          
          {Array.from({ length: 7 }).map((_, i) => (
            renderRecapRow(`BN`, rosters.user1.BENCH[i], rosters.user2.BENCH[i])
          ))}
        </div>

        
        <div className="p-6 bg-gray-900 border-t border-gray-800 text-center">
          <button 
            onClick={onRestart}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/40 transition-transform transform hover:scale-105"
          >
            START NEW DRAFT
          </button>
        </div>
      </div>
    </div>
  );
};


const PlayerModal = ({ player, onClose, onDraft }) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 hover:bg-black/60 rounded-full w-8 h-8 flex items-center justify-center transition z-10"
        >
          ✕
        </button>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
          <img 
            src={getPlayerImage(player)} 
            alt={player.full_name}
            className={`w-36 h-36 border-4 shadow-2xl object-cover z-10 ${
                player.position === 'DEF' ? 'object-contain border-transparent' : 'rounded-full bg-gray-200 border-blue-500'
            }`}
            onError={(e) => e.target.src = "https://sleepercdn.com/images/v2/icons/player_default.webp"}
          />
          <h2 className="text-3xl font-bold text-white mt-4 z-10 text-center">{player.full_name}</h2>
          <div className="flex items-center gap-2 mt-2 z-10">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{player.position}</span>
            <span className="text-gray-400 font-semibold text-lg">{player.team}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">
              2025 Season Stats
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-900/50 rounded-lg p-2">
                <div className="text-2xl font-black text-blue-400">{player.stats?.pts_ppr?.toFixed(1) || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">PTS (PPR)</div>
              </div>
              {player.position === 'QB' ? (
                <>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-xl font-bold text-white">{player.stats?.pass_yd || 0}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Pass Yds</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-xl font-bold text-white">{player.stats?.pass_td || 0}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">TDs</div>
                  </div>
                </>
              ) : player.position === 'DEF' ? (
                <>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-xl font-bold text-white">{player.stats?.sack || 0}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Sacks</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-xl font-bold text-white">{player.stats?.int || 0}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">INTs</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-xl font-bold text-white">{(player.stats?.rush_yd || 0) + (player.stats?.rec_yd || 0)}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Total Yds</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-xl font-bold text-white">{(player.stats?.rush_td || 0) + (player.stats?.rec_td || 0)}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Total TDs</div>
                  </div>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={() => { onDraft(player); onClose(); }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/50 transition-all transform hover:scale-[1.02]"
          >
            DRAFT PLAYER
          </button>
        </div>
      </div>
    </div>
  );
};


const DraftSimulator = () => {
  const [allPlayers, setAllPlayers] = useState([]);
  const [displayPlayers, setDisplayPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPos, setFilterPos] = useState('ALL'); 
  const [gameMode, setGameMode] = useState('PVP'); 
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDraftComplete, setIsDraftComplete] = useState(false); 

  const getEmptyRoster = () => ({ 
    QB: null, RB1: null, RB2: null, WR1: null, WR2: null, TE: null, FLEX: null, DST: null, K: null, BENCH: [] 
  });
  
  const [rosters, setRosters] = useState({ 
    user1: getEmptyRoster(), 
    user2: getEmptyRoster() 
  });
  
  const [turn, setTurn] = useState(1);
  const [round, setRound] = useState(1);
  const [aiAdvice, setAiAdvice] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const rightPanelRef = useRef(null);

  // --- RESTART DRAFT ---
  const restartDraft = () => {
    setRosters({ user1: getEmptyRoster(), user2: getEmptyRoster() });
    setTurn(1);
    setRound(1);
    setErrorMessage('');
    setAiAdvice('');
    setIsDraftComplete(false);
    
    // Re-fetch players to reset the pool
    setLoading(true);
    axios.get('http://localhost:8080/api/players/fetch')
      .then(res => {
        setAllPlayers(res.data);
        setDisplayPlayers(res.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (errorMessage) {
        const timer = setTimeout(() => setErrorMessage(''), 3000);
        return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/players/fetch')
      .then(res => {
        setAllPlayers(res.data);
        setDisplayPlayers(res.data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching players", err));
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = allPlayers.filter(p => {
      const matchesSearch = p.full_name.toLowerCase().includes(term) || 
                            p.team.toLowerCase().includes(term) ||
                            p.position.toLowerCase().includes(term);
      const matchesCategory = filterPos === 'ALL' || p.position === filterPos;
      return matchesSearch && matchesCategory;
    });
    setDisplayPlayers(filtered);
  }, [searchTerm, filterPos, allPlayers]);

  // --- CHECK IF ROSTER IS FULL ---
  const countPlayers = (roster) => {
      let count = roster.BENCH.length;
      if (roster.QB) count++;
      if (roster.RB1) count++;
      if (roster.RB2) count++;
      if (roster.WR1) count++;
      if (roster.WR2) count++;
      if (roster.TE) count++;
      if (roster.FLEX) count++;
      if (roster.DST) count++;
      if (roster.K) count++;
      return count;
  };

  const draftPlayer = (player) => {
    if (!player) return false;

    const currentUser = `user${turn}`;
    const currentRoster = { ...rosters[currentUser], BENCH: [...rosters[currentUser].BENCH] };

    let slot = null;

    if (player.position === 'QB' && !currentRoster.QB) slot = 'QB';
    else if (player.position === 'RB') {
      if (!currentRoster.RB1) slot = 'RB1'; else if (!currentRoster.RB2) slot = 'RB2'; else if (!currentRoster.FLEX) slot = 'FLEX';
    }
    else if (player.position === 'WR') {
      if (!currentRoster.WR1) slot = 'WR1'; else if (!currentRoster.WR2) slot = 'WR2'; else if (!currentRoster.FLEX) slot = 'FLEX';
    }
    else if (player.position === 'TE') {
      if (!currentRoster.TE) slot = 'TE'; else if (!currentRoster.FLEX) slot = 'FLEX';
    }
    else if (player.position === 'DEF' && !currentRoster.DST) slot = 'DST';
    else if (player.position === 'K' && !currentRoster.K) slot = 'K';

    if (!slot) {
        if (currentRoster.BENCH.length >= 7) {
            if (turn === 1) {
                setErrorMessage(`Cannot draft ${player.full_name}. Your ${player.position} slots and Bench (Max 7) are full!`);
            }
            return false; 
        }
        slot = 'BENCH';
    }

    if (slot === 'BENCH') {
        currentRoster.BENCH.push(player);
    } else {
        currentRoster[slot] = player;
    }

    const updatedRosters = { ...rosters, [currentUser]: currentRoster };
    setRosters(updatedRosters);
    
    // CHECK FOR DRAFT COMPLETION (16 players per team = 9 starters + 7 bench)
    const p1Count = countPlayers(updatedRosters.user1);
    const p2Count = countPlayers(updatedRosters.user2);
    
    if (p1Count >= 16 && p2Count >= 16) {
        setIsDraftComplete(true);
        return true;
    }

    const newPool = allPlayers.filter(p => p.player_id !== player.player_id);
    setAllPlayers(newPool);

    if (turn === 2) {
      setTurn(1);
      setRound(prev => prev + 1);
    } else {
      setTurn(2);
    }
    
    if (gameMode === 'PVP' || turn === 2) setAiAdvice('');
    return true; 
  };

  const askAI = async () => {
    setAiLoading(true);
    const currentUser = `user${turn}`;
    try {
      const res = await axios.post('http://localhost:8080/api/ai/suggest', {
        roster: rosters[currentUser],
        availablePlayers: allPlayers.slice(0, 100),
        round: round
      });
      setAiAdvice(res.data.reason ? `${res.data.player}: ${res.data.reason}` : "AI could not decide.");
    } catch (err) {
      console.error(err);
      setAiAdvice("Error connecting to AI.");
    }
    setAiLoading(false);
  };

  useEffect(() => {
    if (!isDraftComplete && gameMode === 'PvAI' && turn === 2) {
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: rightPanelRef.current.scrollHeight, behavior: 'smooth' });
      }

      const performAiPick = async () => {
        setAiLoading(true);
        let playerToDraft = null;

        const cpuRoster = rosters.user2;
        let availableForCpu = allPlayers;

        if (cpuRoster.BENCH.length >= 7) {
            const neededPos = [];
            if (!cpuRoster.QB) neededPos.push('QB');
            if (!cpuRoster.RB1 || !cpuRoster.RB2) neededPos.push('RB');
            if (!cpuRoster.WR1 || !cpuRoster.WR2) neededPos.push('WR');
            if (!cpuRoster.TE) neededPos.push('TE');
            if (!cpuRoster.DST) neededPos.push('DEF');
            if (!cpuRoster.K) neededPos.push('K');
            if (!cpuRoster.FLEX) neededPos.push('RB', 'WR', 'TE');
            
            availableForCpu = allPlayers.filter(p => neededPos.includes(p.position));
            if (availableForCpu.length === 0) availableForCpu = allPlayers; 
        }

        try {
          const res = await axios.post('http://localhost:8080/api/ai/suggest', {
            roster: rosters.user2,
            availablePlayers: availableForCpu.slice(0, 50),
            round: round
          }, { timeout: 8000 });
          
          const suggestedName = res.data.player;
          if (suggestedName) {
              playerToDraft = availableForCpu.find(p => 
                p.full_name.toLowerCase().includes(suggestedName.toLowerCase()) ||
                suggestedName.toLowerCase().includes(p.full_name.toLowerCase())
              );
          }
          if (playerToDraft) setAiAdvice(`AI Auto-Drafted: ${playerToDraft.full_name}`);
        } catch (err) {
          console.warn("⚠️ AI Timeout/Error, skipping to fallback.");
        }

        if (!playerToDraft && availableForCpu.length > 0) {
            playerToDraft = availableForCpu.find(p => ['QB', 'RB', 'WR', 'TE'].includes(p.position));
            if (!playerToDraft) playerToDraft = availableForCpu[0];
            setAiAdvice(`AI Auto-Drafted: ${playerToDraft.full_name} (Fallback)`);
        }

        if (playerToDraft) draftPlayer(playerToDraft);
        setAiLoading(false);
      };

      const timer = setTimeout(performAiPick, 2000);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, allPlayers, round, isDraftComplete]);

 
  if (isDraftComplete) {
    return <DraftRecap rosters={rosters} onRestart={restartDraft} />;
  }

  
  const RosterSlot = ({ label, player }) => (
    <div className="flex items-center bg-gray-800/40 p-2 rounded mb-1 border border-gray-700/50 hover:bg-gray-800 transition-colors min-h-[44px]">
      <div className="w-8 font-bold text-gray-500 text-[10px] tracking-widest">{label}</div>
      {player ? (
        <div className="flex items-center flex-1 min-w-0">
          <img 
            src={getPlayerImage(player)} 
            className={`w-8 h-8 rounded-full border border-gray-600 mr-2 object-cover ${player.position === 'DEF' ? 'bg-transparent border-transparent' : 'bg-gray-300'}`}
            alt="p"
          />
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-bold text-gray-100 truncate">{player.full_name}</div>
            <div className="text-[10px] text-blue-400">{player.position} • {player.team}</div>
          </div>
        </div>
      ) : (
        <div className="text-gray-600 text-xs italic">Empty</div>
      )}
    </div>
  );

  const renderRoster = (userKey) => {
    const r = rosters[userKey];
    const isMyTurn = turn === (userKey === 'user1' ? 1 : 2);
    const initial = userKey === 'user1' ? 'H' : 'C'; 
    
    return (
      <div className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 mb-6 shrink-0 ${
        isMyTurn 
          ? 'bg-gray-800/80 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
          : 'bg-gray-900/50 border-gray-800 opacity-80'
      }`}>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-inner ${
                isMyTurn ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
                {initial}
            </div>
            
            <div className="flex-1">
                <h3 className={`font-bold text-sm uppercase tracking-wider ${
                isMyTurn ? 'text-white' : 'text-gray-400'
                }`}>
                {userKey === 'user1' ? "Team Human" : "Team CPU"}
                </h3>
                {isMyTurn && <div className="text-[10px] text-blue-400 font-bold animate-pulse">● PICKING NOW</div>}
            </div>
        </div>

        <div className="flex-1">
          <RosterSlot label="QB" player={r.QB} />
          <RosterSlot label="RB" player={r.RB1} />
          <RosterSlot label="RB" player={r.RB2} />
          <RosterSlot label="WR" player={r.WR1} />
          <RosterSlot label="WR" player={r.WR2} />
          <RosterSlot label="TE" player={r.TE} />
          <RosterSlot label="FLX" player={r.FLEX} />
          <RosterSlot label="DEF" player={r.DST} />
          <RosterSlot label="K" player={r.K} />
          <div className="mt-4 pt-2 border-t border-gray-700">
             <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-bold">Bench ({r.BENCH.length}/7)</div>
             {r.BENCH.length === 0 && <div className="text-xs text-gray-600 italic pl-8">No bench players</div>}
             {r.BENCH.map((p, i) => <RosterSlot key={i} label={`BN`} player={p} />)}
          </div>
        </div>
      </div>
    );
  };

  const categories = ['ALL', 'QB', 'RB', 'WR', 'TE', 'DEF', 'K'];

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="animate-bounce text-xl font-bold tracking-widest text-blue-500">LOADING DRAFT...</div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0D12] text-white font-sans flex flex-col overflow-hidden selection:bg-blue-500 selection:text-white relative">
      
      
      {errorMessage && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-8 py-4 rounded-xl shadow-2xl z-[100] font-bold border border-red-400 animate-bounce flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            {errorMessage}
        </div>
      )}

      
      <header className="bg-[#111318] border-b border-gray-800 p-4 shrink-0 z-30 shadow-2xl">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="text-2xl font-black tracking-tighter text-white">
               DRAFT<span className="text-blue-600">ZONE</span>
             </div>
             <div className="h-6 w-px bg-gray-700 mx-2"></div>
             <div className="text-xs font-mono text-gray-400">
               RD <span className="text-white font-bold">{round}</span> / PK <span className="text-white font-bold">{turn}</span>
             </div>
          </div>

          <div className="flex bg-black p-1 rounded-lg border border-gray-800">
             <button onClick={() => setGameMode('PVP')} className={`px-5 py-2 rounded text-xs font-bold transition-all ${gameMode === 'PVP' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>PVP</button>
             <button onClick={() => setGameMode('PvAI')} className={`px-5 py-2 rounded text-xs font-bold transition-all ${gameMode === 'PvAI' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>VS AI</button>
          </div>

          <div className="w-full md:w-auto text-right">
             {(gameMode === 'PVP' || turn === 1) && (
               <button onClick={askAI} disabled={aiLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-bold text-sm shadow-lg shadow-emerald-900/20 transition hover:translate-y-[-2px]">
                 {aiLoading ? "ANALYSING..." : "ASK AI ASSISTANT"}
               </button>
             )}
             {aiAdvice && <div className="text-[10px] text-yellow-400 mt-2 font-mono tracking-wide animate-pulse">{aiAdvice}</div>}
          </div>
        </div>
      </header>

      
      <div className="flex-1 flex overflow-hidden max-w-[1920px] w-full mx-auto p-6 gap-6">
        
      
        <div className="flex-[3] flex flex-col gap-6 overflow-hidden min-w-0">
          
          
          <div className="flex flex-col gap-4 shrink-0">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search players..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1D24] border border-gray-800 text-white p-4 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-lg placeholder-gray-600"
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-4 top-4.5 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterPos(cat)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all transform hover:-translate-y-0.5 ${
                    filterPos === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          
          <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {displayPlayers.slice(0, 80).map(p => (
                <div key={p.player_id} className="bg-[#1e2128] rounded-xl border border-gray-700 hover:border-blue-500 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col group relative overflow-hidden min-h-[260px]">
                  <div className={`h-1.5 w-full ${
                      p.position === 'QB' ? 'bg-pink-500' :
                      p.position === 'RB' ? 'bg-green-500' :
                      p.position === 'WR' ? 'bg-blue-500' :
                      p.position === 'TE' ? 'bg-orange-500' :
                      p.position === 'DEF' ? 'bg-purple-500' :
                      'bg-gray-500'
                  }`}></div>

                  <div className="pt-6 pb-2 flex justify-center items-center">
                      <div className="relative">
                          <img 
                            src={getPlayerImage(p)} 
                            alt={p.full_name}
                            className={`w-20 h-20 shadow-lg object-contain ${
                              p.position === 'DEF' ? 'rounded-none' : 'rounded-full bg-gray-200 border-2 border-gray-600 object-cover'
                            }`}
                            loading="lazy"
                            onError={(e) => e.target.src = "https://sleepercdn.com/images/v2/icons/player_default.webp"}
                          />
                          <span className="absolute -bottom-2 -right-2 bg-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-600 text-gray-300">
                            {p.position}
                          </span>
                      </div>
                  </div>
                  
                  <div className="px-2 pb-4 text-center flex-1 flex flex-col justify-center">
                      <div className="font-bold text-white text-sm mb-1 leading-tight line-clamp-2">{p.full_name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{p.team || "FA"}</div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-gray-700 divide-x divide-gray-700 mt-auto">
                      <button 
                        onClick={() => setSelectedPlayer(p)}
                        className="py-3 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-gray-700 transition-colors uppercase"
                      >
                        Stats
                      </button>
                      <button 
                        onClick={() => draftPlayer(p)}
                        disabled={gameMode === 'PvAI' && turn === 2}
                        className={`py-3 text-[10px] font-bold uppercase transition-colors ${
                          gameMode === 'PvAI' && turn === 2 
                          ? 'text-gray-600 cursor-not-allowed bg-gray-900'
                          : 'text-blue-400 hover:text-white hover:bg-blue-600'
                        }`}
                      >
                        Draft
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div ref={rightPanelRef} className="flex-1 min-w-[320px] max-w-md flex flex-col gap-4 overflow-y-auto pb-8 custom-scrollbar">
           {renderRoster('user1')}
           {renderRoster('user2')}
        </div>

      </div>

      
      {selectedPlayer && (
        <PlayerModal 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          onDraft={(p) => draftPlayer(p)}
        />
      )}
    </div>
  );
};

export default DraftSimulator;