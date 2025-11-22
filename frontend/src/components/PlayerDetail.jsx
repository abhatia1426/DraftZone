import {
    ArrowLeft,
    Flame,
    TrendingUp,
    TrendingDown,
    Zap,
    Star,
  } from "lucide-react";
  import MiniChart from "./MiniChart";
  
  const posColors = {
    QB: "#3b82f6",
    RB: "#10b981",
    WR: "#a855f7",
    TE: "#ec4899",
  };
  
  export default function PlayerDetail({ player, onBack }) {
    const posColor = posColors[player.position];
  
    const stats =
      player.position === "QB"
        ? [
            { label: "Pass Yards", value: player.passing?.yards },
            { label: "Pass TDs", value: player.passing?.tds },
            { label: "Rush Yards", value: player.rushing?.yards },
            { label: "Rush TDs", value: player.rushing?.tds },
          ]
        : player.position === "RB"
        ? [
            { label: "Rush Yards", value: player.rushing?.yards },
            { label: "Rush TDs", value: player.rushing?.tds },
            { label: "Receptions", value: player.receiving?.receptions },
            { label: "Rec TDs", value: player.receiving?.recTD },
          ]
        : [
            { label: "Receptions", value: player.receiving?.receptions },
            { label: "Rec Yards", value: player.receiving?.recYards },
            { label: "Rec TDs", value: player.receiving?.recTD },
            {
              label: "Route Win",
              value: player.advanced?.routeWinRate
                ? `${(player.advanced.routeWinRate * 100).toFixed(0)}%`
                : "N/A",
            },
          ];
  
    return (
      <div className="animate-fadeIn mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Search</span>
        </button>
  
        <div className="bg-[#111827]/40 backdrop-blur-xl rounded-3xl border border-slate-700/40 overflow-hidden shadow-xl shadow-black/30">
          <div
            className="h-2"
            style={{
              background: `linear-gradient(90deg, ${player.color}, ${posColor})`,
            }}
          />
  
          <div className="p-10 space-y-10">
  
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-10">
  
              {/* Player photo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-800 ring-4 ring-slate-700/40 shadow-2xl">
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
  
                {player.trends.hotStreak && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
  
              {/* Player info */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-bold"
                    style={{ background: `${posColor}20`, color: posColor }}
                  >
                    {player.position}
                  </span>
                  <span className="text-slate-400">{player.team}</span>
                </div>
                <h1 className="text-4xl font-bold text-white">{player.name}</h1>
  
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-slate-300">Top {player.position}</span>
                </div>
              </div>
  
              {/* Fantasy PPG */}
              <div className="text-center bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-black/20">
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {player.fantasy.ppg}
                </div>
                <div className="text-sm text-slate-400 mt-1">Fantasy PPG</div>
              </div>
            </div>
  
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-slate-900/40 rounded-2xl p-6 text-center border border-slate-700/30 shadow-md shadow-black/20"
                >
                  <div className="text-3xl font-bold text-white">
                    {stat.value ?? "N/A"}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
  
            {/* Secondary Metrics */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-emerald-500/10 rounded-2xl p-6 text-center border border-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-400">
                  {(player.fantasy.boomRate * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">Boom Rate</div>
              </div>
  
              <div className="bg-red-500/10 rounded-2xl p-6 text-center border border-red-500/20">
                <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-400">
                  {(player.fantasy.bustRate * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">Bust Rate</div>
              </div>
  
              <div className="bg-purple-500/10 rounded-2xl p-6 text-center border border-purple-500/20">
                <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">
                  {player.advanced?.epaPerPlay?.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">EPA/Play</div>
              </div>
            </div>
  
            {/* Performance Trend */}
            <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-700/30 shadow-md shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Performance Trend
                </h3>
  
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-400 text-sm">
                  Next Week: {player.trends.projectedNextWeek}
                </div>
              </div>
  
              <div className="h-28">
                <MiniChart
                  data={player.trends.last5GamesPPG}
                  color={posColor}
                />
              </div>
  
              <div className="flex justify-between text-xs text-slate-500 mt-3">
                {player.trends.last5GamesPPG.map((ppg, i) => (
                  <span key={i}>Wk {i + 1}: {ppg}</span>
                ))}
              </div>
            </div>
  
          </div>
        </div>
      </div>
    );
  }
  