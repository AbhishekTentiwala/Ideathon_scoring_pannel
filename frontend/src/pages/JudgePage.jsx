import { useState, useEffect } from "react";
import { FiCheckCircle, FiClock, FiSearch, FiLogOut, FiAward } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../lib/AuthContext.jsx";
import StarRating from "../components/shared/StarRating.jsx";
import api from "../lib/api.js";
import { CRITERIA, MAX_SCORE } from "../lib/scoring.js";

const emptyRatings = () => Object.fromEntries(CRITERIA.map(c => [c.key, 0]));

export default function JudgePage() {
  const { judge, logout } = useAuth();
  const [startups, setStartups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [ratings, setRatings] = useState(emptyRatings());
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    api.get("/startups").then(({ startups }) => setStartups(startups));
    api.get("/evaluations/progress").then(({ evaluated }) => setProgress(evaluated));
  }, []);

  
  const selectStartup = async (s) => {
    setSelected(s);
    setSubmitted(false);
    setNotes("");
    setRatings(emptyRatings());

    const { evaluation } = await api.get(`/evaluations/my/${s._id}`);
    if (evaluation) {
      setRatings(evaluation.ratings);
      setNotes(evaluation.notes || "");
    }
  };

  const computeLiveScore = () =>
    CRITERIA.reduce((sum, c) => sum + (ratings[c.key] || 0) * c.weightage, 0);

  const allRated = CRITERIA.every(c => ratings[c.key] >= 1);
  const liveScore = computeLiveScore();

  const handleSubmit = async () => {
    if(!selected) return toast.error("Select a startup first");
    if (!allRated) return toast.error(`Please rate all ${CRITERIA.length} criteria`);

    setSubmitting(true);
    try {
      const res = await api.post("/evaluations", {
        startupId: selected._id,
        ratings,
        notes,
      });
      toast.success(`Score saved: ${res.evaluation.calculatedScore}/${MAX_SCORE}`);
      setProgress(p => ({ ...p, [selected._id]: res.evaluation.calculatedScore }));
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const normalizedSearch = search.toLowerCase();
  const filteredStartups = startups.filter((s) =>
    (s.teamName || "").toLowerCase().includes(normalizedSearch) ||
    (s.projectTitle || "").toLowerCase().includes(normalizedSearch)
  );

  const evaluatedCount = Object.keys(progress).length;

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b border-ink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-3 sm:h-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">

            <div>
              <span className="font-display font-bold text-ink text-sm">Startup Khumb</span>
              <span className="text-ink-400 text-xs ml-2 block sm:inline sm:ml-2">Evaluation Portal</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-ink-600 bg-jade/10 border border-jade/20 rounded-full px-3 py-1.5">
              <FiCheckCircle className="text-jade text-sm" />
              {evaluatedCount}/{startups.length} evaluated
            </span>
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                {judge?.name?.[0]}
              </div>
              <span className="hidden md:inline font-medium">{judge?.name}</span>
            </div>
            <button onClick={logout} className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5">
              <FiLogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-5 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1">
        
        <aside className="w-full lg:w-72 lg:flex-shrink-0 flex flex-col gap-3">
          <div className="card p-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search startups…"
                className="input pl-9 py-2.5 text-sm" />
            </div>
          </div>

          <div className="card flex-1 overflow-y-auto max-h-[42vh] lg:max-h-[calc(100vh-180px)]">
            <div className="p-3 border-b border-ink-100">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider">
                {filteredStartups.length} Startups
              </p>
            </div>
            <div className="divide-y divide-ink-50">
              {filteredStartups.map(s => {
                const done = !!progress[s._id];
                const score = progress[s._id];
                const active = selected?._id === s._id;
                return (
                  <button key={s._id} onClick={() => selectStartup(s)}
                    className={`w-full text-left px-4 py-3 transition-all duration-150 hover:bg-ink-50
                                      ${active ? "bg-brand/5 border-l-2 border-brand" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${active ? "text-brand" : "text-ink"}`}>
                          {s.teamName}
                        </p>
                        <p className="text-xs text-ink-400 truncate mt-0.5">
                          {s.projectTitle || "Project title not added yet"}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {done
                          ? <span className="badge bg-jade/10 text-jade">{score}/{MAX_SCORE}</span>
                          : <span className="badge bg-ink-100 text-ink-400"><FiClock size={10} /></span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-medium text-ink-400">#{s.pitchOrder}</span>
                      {s.category && (
                        <span className="text-[10px] badge bg-ink-100 text-ink-500 px-1.5 py-0.5">
                          {s.category}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col gap-4">
          {!selected ? (
            <div className="flex-1 card flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-3xl mb-4">⚖️</div>
              <h2 className="section-title text-xl mb-2">Select a Startup</h2>
              <p className="text-ink-400 text-sm max-w-xs">
                Choose a startup from the left panel to begin your evaluation.
              </p>
            </div>
          ) : (
            <>
              <div className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="badge bg-brand/10 text-brand">#{selected.pitchOrder}</span>
                      {selected.category && <span className="badge bg-ink-100 text-ink-500">{selected.category}</span>}
                      {progress[selected._id] && <span className="badge bg-jade/10 text-jade flex items-center gap-1"><FiCheckCircle size={10} />Submitted</span>}
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-ink tracking-tight break-words">{selected.teamName}</h2>
                    <p className="text-ink-400 text-sm mt-1 italic break-words">
                      "{selected.projectTitle || "Project title not added yet"}"
                    </p>
                  </div>

                  <div className="w-full sm:w-auto flex-shrink-0 text-center bg-ink-50 rounded-2xl px-4 sm:px-5 py-4 border border-ink-100">
                    <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-1">Live Score</p>
                    <p className="font-display font-bold text-3xl text-brand leading-none">{liveScore}</p>
                    <p className="text-xs text-ink-400 mt-1">/{MAX_SCORE}</p>
                    <div className="mt-2 h-1.5 bg-ink-200 rounded-full w-full sm:w-24 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand to-accent rounded-full transition-all duration-500"
                        style={{ width: `${(liveScore / MAX_SCORE) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="section-title text-base mb-4">Evaluation Criteria</h3>
                <div className="space-y-1">
                  {CRITERIA.map((c, i) => {
                    const scored = (ratings[c.key] || 0) * c.weightage;
                    const isRated = ratings[c.key] >= 1;
                    return (
                      <div key={c.key}
                        className={`rounded-xl px-4 py-4 transition-all duration-200 animate-fade-up opacity-0 [animation-fill-mode:forwards]
                                       ${isRated ? `${c.bg} border border-current/10` : "bg-ink-50 border border-transparent"}`}
                        style={{ animationDelay: `${i * 40}ms` }}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className={`text-[10px] font-black tracking-widest uppercase ${c.color}`}>{c.key}</span>
                              <span className="text-[10px] font-semibold text-ink-400">×{c.weightage} weight · max {c.weightage * 5} pts</span>
                            </div>
                            <p className="text-sm font-semibold text-ink mb-1">{c.label}</p>
                            <p className="text-xs text-ink-400">{c.desc}</p>
                            <div className="mt-3">
                              <StarRating
                                value={ratings[c.key]}
                                onChange={v => setRatings(p => ({ ...p, [c.key]: v }))}
                                disabled={submitted}
                              />
                            </div>
                          </div>
                          <div className={`flex-shrink-0 w-full sm:w-12 h-12 rounded-xl flex flex-col items-center justify-center
                                           transition-all duration-300 ${isRated ? "bg-white shadow-sm border border-ink-100" : "bg-white/0"}`}>
                            <span className={`font-display font-bold text-lg leading-none ${isRated ? c.color : "text-ink-200"}`}>
                              {isRated ? scored : "—"}
                            </span>
                            {isRated && <span className="text-[9px] text-ink-300 mt-0.5">pts</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

          
              <div className="card p-5">
                <label className="label">Private Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  disabled={submitted}
                  placeholder="Add your private observations about this startup…"
                  rows={3}
                  className="input resize-none" />
                <p className="text-[11px] text-ink-400 mt-1.5">🔒 Notes are private and never shown to startups.</p>
              </div>

              <div className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-ink-600 mb-0.5">Score Breakdown</p>
                    <div className="flex flex-wrap gap-2">
                      {CRITERIA.map(c => (
                        <span key={c.key} className="text-xs font-mono text-ink-500">
                          {c.key}:{(ratings[c.key] || 0)}×{c.weightage}=
                          <strong className="text-ink">{(ratings[c.key] || 0) * c.weightage}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="font-display font-bold text-4xl text-brand leading-none">{liveScore}</p>
                    <p className="text-xs text-ink-400 mt-0.5">out of {MAX_SCORE}</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="flex items-center gap-3 bg-jade/10 border border-jade/20 rounded-xl p-4">
                    <FiCheckCircle className="text-jade text-xl flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-jade">Evaluation submitted!</p>
                      <p className="text-xs text-jade/70">Select another startup from the left panel.</p>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleSubmit} disabled={!allRated || submitting} className="btn-primary w-full py-3.5">
                    {submitting
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                      : <><FiAward />Submit Evaluation ({liveScore}/{MAX_SCORE})</>}
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
