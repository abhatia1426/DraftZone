import {
    Flame,
    TrendingUp,
    TrendingDown,
    Target,
    ChevronRight
  } from "lucide-react";
  import MiniChart from "./MiniChart";
  
  const posColors = {
    QB: "#3b82f6",
    RB: "#10b981",
    WR: "#a855f7",
    TE: "#ec4899",
  };
  
  export default function PlayerCard({ player, onClick }) {
    const posColor = posColors[player.position];
  
    return (
      <div
        onClick={onClick}
        className="group relative bg-[#111827]/40 backdrop-blur-xl rounded-2xl border border-slate-700/40 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.015] hover:shadow-2xl hover:shadow-purple-500/20"
      >
        <div className="absolute top-0 left-0 right-0 h-1" 
             style={{ background: `linear-gradient(90deg, ${player.color}, ${posColor})` }} 
        />
  
        <div className="p-6">
  
          <div className="flex items-start gap-4">
  
            <div className="relative">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 ring-2 ring-slate-700/40">
                <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
              </div>
  
              {player.trends.hotStreak && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
  
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-1 rounded-md text-xs font-bold"
                  style={{
                    background: `${posColor}20`,
                    color: posColor,
                  }}
                >
                  {player.position}
                </span>
  
                <span className="text-slate-500 text-xs">{player.team}</span>
              </div>
  
              <h3 className="text-white font-semibold text-lg truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-300 transition-all">
                {player.name}
              </h3>
            </div>
  
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {player.fantasy.ppg}
              </div>
              <div className="text-xs text-slate-500">PPG</div>
            </div>
          </div>
  
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-slate-900/40 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span className="text-sm font-semibold">
                  {(player.fantasy.boomRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Boom</div>
            </div>
  
            <div className="bg-slate-900/40 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-red-400">
                <TrendingDown className="w-3 h-3" />
                <span className="text-sm font-semibold">
                  {(player.fantasy.bustRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Bust</div>
            </div>
  
            <div className="bg-slate-900/40 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400">
                <Target className="w-3 h-3" />
                <span className="text-sm font-semibold">
                  {(player.fantasy.consistency * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Floor</div>
            </div>
          </div>
  
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Last 5 Games</span>
              <span className="text-xs text-cyan-400">
                Proj: {player.trends.projectedNextWeek}
              </span>
            </div>
            <MiniChart data={player.trends.last5GamesPPG} color={posColor} />
          </div>
        </div>
  
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </div>
      </div>
    );
  }
  