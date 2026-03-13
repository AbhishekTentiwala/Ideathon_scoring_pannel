import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FiDownload, FiRefreshCw, FiAward, FiUsers, FiTrendingUp, FiZap } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../lib/api.js";
import { exportResultsPDF } from "../lib/exportPDF.js";
import { CRITERIA, MAX_SCORE } from "../lib/scoring.js";

const CATEGORY_COLORS = {
  CleanTech: "bg-jade/10 text-jade",
  FinTech: "bg-sky/10 text-sky",
  HealthTech: "bg-rose/10 text-rose",
  EdTech: "bg-gold/10 text-gold-600",
  AgriTech: "bg-jade/10 text-jade",
  DeepTech: "bg-sky/10 text-sky",
  SocialImpact: "bg-brand/10 text-brand",
};

const RANK_STYLE = [
  "bg-gradient-to-r from-yellow-400/20 to-amber-300/20 border-yellow-300/40",
  "bg-gradient-to-r from-slate-300/20 to-slate-200/20 border-slate-300/40",
  "bg-gradient-to-r from-orange-300/20 to-amber-200/20 border-orange-300/40",
];

const RANK_BADGE = ["🥇", "🥈", "🥉"];

function ScoreBar({ pct, animate }) {
  return (
    <div className="h-1.5 bg-ink-100 rounded-full w-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: animate ? `${pct}%` : "0%",
          background: pct >= 70 ? "linear-gradient(90deg,#22C55E,#16A34A)"
            : pct >= 45 ? "linear-gradient(90deg,#EA700B,#F59E0B)"
              : "linear-gradient(90deg,#EF4444,#EA700B)",
        }}
      />
    </div>
  );
}

export default function AdminPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [maxScore, setMaxScore] = useState(MAX_SCORE);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [animated, setAnimated] = useState(false);
  const socketRef = useRef(null);
  const socketUrl =
    import.meta.env.VITE_SERVER_URL ||
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:4000";


  useEffect(() => {
    const socket = io(socketUrl);
    socketRef.current = socket;

    // Initial leaderboard on connect
    socket.on("leaderboard:init", ({ leaderboard, maxScore }) => {
      setLeaderboard(leaderboard);
      setMaxScore(maxScore);
      setLoading(false);
      setTimeout(() => setAnimated(true), 100);
    });

    socket.on("leaderboard:updated", ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setLastUpdate(new Date());
      setAnimated(false);
      setTimeout(() => setAnimated(true), 80);
      toast.success("Leaderboard updated!", { id: "lb-update", icon: "⚡", duration: 2000 });
    });

    return () => socket.disconnect();
  }, [socketUrl]);

  const refresh = async () => {
    setLoading(true);
    try {
      const { leaderboard } = await api.get("/evaluations/leaderboard");
      setLeaderboard(leaderboard);
      setAnimated(false);
      setTimeout(() => setAnimated(true), 80);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await api.get("/evaluations/admin/full");
      exportResultsPDF(data);
      toast.success("PDF exported!");
    } catch (err) {
      toast.error("Export failed: " + (err?.message || "unknown error"));
    } finally {
      setExporting(false);
    }
  };

  const totalEvals = leaderboard.reduce((s, r) => s + r.totalEvaluations, 0);
  const topScore = leaderboard[0]?.averageScore || 0;
  const fullyScored = leaderboard.filter(r => r.totalEvaluations >= 5).length;

  return (
    <div className="min-h-screen bg-ink-800 text-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-20 bg-ink-800/95 backdrop-blur border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-3 sm:h-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">

            <span className="font-display font-bold text-white text-sm">Startup Khumb</span>
            <span className="text-white/30 text-xs">· Admin Leaderboard</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Live indicator */}
            <span className="flex items-center gap-1.5 text-xs font-medium text-jade bg-jade/10 border border-jade/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
              Live
            </span>
            {lastUpdate && (
              <span className="hidden sm:block text-xs text-white/30">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button onClick={refresh} className="btn-ghost bg-white/5 border-white/10 text-white hover:bg-white/10 px-3 py-2 flex items-center gap-1.5 text-xs">
              <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-2 bg-brand text-white text-xs font-semibold rounded-xl px-4 py-2.5 transition-all hover:bg-brand-dark disabled:opacity-40"
              style={{ boxShadow: "0 4px 14px rgba(0,58,140,0.4)" }}>
              {exporting
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FiDownload size={13} />}
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
    
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Startups", value: leaderboard.length, icon: <FiUsers />, color: "text-sky" },
            { label: "Evaluations", value: totalEvals, icon: <FiTrendingUp />, color: "text-jade" },
            { label: "Fully Judged", value: fullyScored, icon: <FiAward />, color: "text-gold" },
            { label: "Top Score", value: topScore > 0 ? `${topScore.toFixed(1)}/${maxScore}` : "—", icon: <FiZap />, color: "text-brand" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white/5 border border-white/8 rounded-2xl px-5 py-4">
              <div className={`${color} mb-2 text-lg`}>{icon}</div>
              <p className="font-display font-bold text-2xl text-white">{value}</p>
              <p className="text-xs text-white/40 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">Live Rankings</h1>
            <p className="text-white/40 text-sm mt-1">Ranked by average weighted score · Max {maxScore} pts</p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-white/30">
            <span>🥇 1st  🥈 2nd  🥉 3rd</span>
          </div>
        </div>

        
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-24 bg-white/3 rounded-3xl border border-white/8">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-white/40 font-medium">No evaluations yet.</p>
            <p className="text-white/25 text-sm mt-1">Scores will appear here as judges submit.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((row, idx) => {
              const isTop3 = idx < 3;
              const delay = `${idx * 30}ms`;
              const pct = row.percentage;

              return (
                <div
                  key={row.id}
                  className={`
                    group relative rounded-2xl border px-5 py-4 transition-all duration-200
                    hover:scale-[1.005] cursor-default
                    ${animated ? "animate-fade-up opacity-0 [animation-fill-mode:forwards]" : "opacity-100"}
                    ${isTop3 ? RANK_STYLE[idx] : "bg-white/4 border-white/8 hover:bg-white/7"}
                  `}
                  style={{ animationDelay: animated ? delay : "0ms" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-full sm:w-10 flex-shrink-0 text-left sm:text-center">
                      {isTop3
                        ? <span className="text-2xl">{RANK_BADGE[idx]}</span>
                        : <span className="font-display font-bold text-lg text-white/30">#{row.rank}</span>
                      }
                    </div>

       
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-semibold text-white text-sm">{row.teamName}</h3>
                        {row.category && (
                          <span className={`badge text-[10px] ${CATEGORY_COLORS[row.category] || "bg-white/10 text-white/50"}`}>
                            {row.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 truncate italic">
                        "{row.projectTitle || "Project title not added yet"}"
                      </p>
                    </div>

               
                    <div className="w-full sm:w-40">
                      <ScoreBar pct={pct} animate={animated} />
                      <p className="text-[10px] text-white/30 mt-1">{pct}%</p>
                    </div>

         
                    <div className="flex-shrink-0 text-left sm:text-center sm:px-3">
                      <div className="flex gap-1 justify-start sm:justify-center mb-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < row.totalEvaluations ? "bg-jade" : "bg-white/15"}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-white/30">{row.totalEvaluations}/5 judges</p>
                    </div>

                    <div className="flex-shrink-0 text-left sm:text-right min-w-[80px]">
                      <p className={`font-display font-bold text-2xl leading-none
                                     ${idx === 0 ? "text-yellow-400"
                          : idx === 1 ? "text-slate-300"
                            : idx === 2 ? "text-orange-300"
                              : "text-white"}`}>
                        {row.averageScore > 0 ? row.averageScore.toFixed(1) : "—"}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">/{maxScore}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Criteria legend ── */}
        <div className="mt-10 bg-white/3 border border-white/8 rounded-2xl p-5">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Scoring Criteria</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {CRITERIA.map((c) => (
              <div key={c.key} className="text-center bg-white/4 rounded-xl p-3">
                <span className="text-[11px] font-black text-brand tracking-wider">{c.key}</span>
                <p className="text-xs text-white/50 mt-0.5 truncate">{c.label}</p>
                <p className="text-xs font-semibold text-white/70 mt-1">×{c.weightage} wt</p>
                <p className="text-[10px] text-white/30">max {c.weightage * 5}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
