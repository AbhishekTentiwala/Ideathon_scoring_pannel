import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiLock, FiShield, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../lib/api.js";

const SESSION_KEY = "special_admin_password";

export default function SpecialAdminLeaderboardPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [locked, setLocked] = useState(true);

  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [maxScore, setMaxScore] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY) || "";
    if (!saved) return;
    setAdminPassword(saved);
    setLocked(false);
  }, []);

  const fetchLeaderboard = async (password) => {
    setLoading(true);
    try {
      const { leaderboard, maxScore } = await api.get(
        "/evaluations/admin/non-zero-leaderboard",
        { headers: { "x-special-admin-password": password } }
      );
      setLeaderboard(leaderboard || []);
      setMaxScore(maxScore || 0);
    } catch (err) {
      toast.error(err?.message || "Could not load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locked || !adminPassword) return;
    fetchLeaderboard(adminPassword);
  }, [locked, adminPassword]);

  const unlock = async (e) => {
    e.preventDefault();
    const candidate = passwordInput.trim();
    if (!candidate) return toast.error("Enter password");

    setLoading(true);
    try {
      await api.get("/evaluations/admin/non-zero-leaderboard", {
        headers: { "x-special-admin-password": candidate },
      });
      sessionStorage.setItem(SESSION_KEY, candidate);
      setAdminPassword(candidate);
      setLocked(false);
      setPasswordInput("");
      toast.success("Leaderboard unlocked");
    } catch (err) {
      toast.error(err?.message || "Wrong password");
    } finally {
      setLoading(false);
    }
  };

  const standings = useMemo(() => {
    return [...leaderboard]
      .sort((a, b) => {
        if ((b.averageScore || 0) !== (a.averageScore || 0)) {
          return (b.averageScore || 0) - (a.averageScore || 0);
        }
        return (b.totalEvaluations || 0) - (a.totalEvaluations || 0);
      })
      .map((row, index) => ({ ...row, standing: index + 1 }));
  }, [leaderboard]);

  if (locked) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#fde68a_0%,#f8fafc_35%,#e2e8f0_100%)] text-ink flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white/85 backdrop-blur border border-white shadow-float p-7 animate-pop">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <FiShield size={26} />
          </div>
          <h1 className="font-display text-2xl text-ink mb-1">Superadmin Leaderboard</h1>
          <p className="text-sm text-ink-400 mb-5">Password required to view non-zero evaluation standings.</p>

          <form onSubmit={unlock} className="space-y-4">
            <label className="label">Access Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                type="password"
                className="input pl-10"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? <FiRefreshCw className="animate-spin" /> : <FiShield />}
              Unlock Leaderboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0b1120_100%)] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/90 font-semibold">Superadmin</p>
            <h1 className="font-display text-xl sm:text-2xl">Non-Zero Evaluation Leaderboard</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <Link to="/special-admin" className="btn-ghost bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs sm:text-sm px-3 py-2">
              <FiArrowLeft /> Manage Startups
            </Link>
            <button
              onClick={() => fetchLeaderboard(adminPassword)}
              className="btn-ghost bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs sm:text-sm px-3 py-2"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-4 text-sm text-white/70">
          Standing is sorted by average score (highest first). Showing only startups with evaluations above zero.
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-xl overflow-hidden">
          {loading ? (
            <div className="p-6 text-white/70 text-sm">Loading leaderboard...</div>
          ) : standings.length === 0 ? (
            <div className="p-6 text-white/70 text-sm">No evaluated startups found yet.</div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[80px,1.3fr,1fr,140px,140px] gap-3 px-4 py-3 text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
                <span>Standing</span>
                <span>Team</span>
                <span>Project</span>
                <span>Avg Score</span>
                <span>Evals</span>
              </div>

              <div className="hidden md:block">
                {standings.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[80px,1.3fr,1fr,140px,140px] gap-3 px-4 py-4 border-b border-white/10 last:border-b-0 hover:bg-white/[0.08]"
                  >
                    <span className="font-display text-lg text-amber-300">#{row.standing}</span>
                    <span className="font-semibold truncate" title={row.teamName}>{row.teamName}</span>
                    <span className="text-white/75 truncate" title={row.projectTitle || "No project title"}>{row.projectTitle || "No project title"}</span>
                    <span className="font-semibold text-cyan-300">{Number(row.averageScore || 0).toFixed(2)} / {maxScore}</span>
                    <span className="text-white/80">{row.totalEvaluations}</span>
                  </div>
                ))}
              </div>

              <div className="md:hidden divide-y divide-white/10">
                {standings.map((row) => (
                  <div key={row.id} className="px-4 py-4 hover:bg-white/[0.08]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg text-amber-300">#{row.standing}</p>
                        <p className="font-semibold truncate" title={row.teamName}>{row.teamName}</p>
                        <p className="text-xs text-white/70 truncate" title={row.projectTitle || "No project title"}>
                          {row.projectTitle || "No project title"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-cyan-300 font-semibold text-sm">{Number(row.averageScore || 0).toFixed(2)} / {maxScore}</p>
                        <p className="text-xs text-white/70">{row.totalEvaluations} evals</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
