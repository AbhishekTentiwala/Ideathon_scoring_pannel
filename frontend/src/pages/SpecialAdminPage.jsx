import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiLock,
  FiShield,
  FiPlus,
  FiSave,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiEdit3,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../lib/api.js";

const SESSION_KEY = "special_admin_password";
const DEFAULT_FORM = {
  teamName: "",
  projectTitle: "",
  founders: "",
  description: "",
  category: "",
  pitchOrder: "",
};

export default function SpecialAdminPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [locked, setLocked] = useState(true);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [startups, setStartups] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY) || "";
    if (!saved) return;
    setAdminPassword(saved);
    setLocked(false);
  }, []);

  const authHeaders = useMemo(() => ({
    headers: {
      "x-special-admin-password": adminPassword,
    },
  }), [adminPassword]);

  const loadStartups = async () => {
    if (!adminPassword) return;
    setLoading(true);
    try {
      const { startups } = await api.get("/startups");
      setStartups(startups || []);
    } catch (err) {
      toast.error(err?.message || "Could not load startups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locked || !adminPassword) return;
    loadStartups();
  }, [locked, adminPassword]);

  const onUnlock = async (e) => {
    e.preventDefault();
    const candidate = passwordInput.trim();
    if (!candidate) return toast.error("Enter password");

    setLoading(true);
    try {
      // Verify password by attempting a protected no-op style call:
      // create with invalid payload should still pass auth before failing validation.
      await api.post("/startups", {}, {
        headers: { "x-special-admin-password": candidate },
      });
      toast.success("Unlocked special admin access");
      setAdminPassword(candidate);
      sessionStorage.setItem(SESSION_KEY, candidate);
      setLocked(false);
      setPasswordInput("");
    } catch (err) {
      const message = (err?.message || "").toLowerCase();
      if (message.includes("unauthorized") || message.includes("invalid special admin password")) {
        toast.error("Wrong password");
      } else {
        // Validation failure means password was correct.
        if (message.includes("validation")) {
          setAdminPassword(candidate);
          sessionStorage.setItem(SESSION_KEY, candidate);
          setLocked(false);
          setPasswordInput("");
          toast.success("Unlocked special admin access");
        } else {
          toast.error("Could not verify password. Try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...startups]
      .sort((a, b) => (a.pitchOrder || 0) - (b.pitchOrder || 0))
      .filter((s) => {
        if (!q) return true;
        return (
          (s.teamName || "").toLowerCase().includes(q) ||
          (s.projectTitle || "").toLowerCase().includes(q) ||
          (s.category || "").toLowerCase().includes(q)
        );
      });
  }, [startups, search]);

  const resetForm = () => {
    setSelectedId("");
    setForm(DEFAULT_FORM);
  };

  const selectStartup = (startup) => {
    setSelectedId(startup._id);
    setForm({
      teamName: startup.teamName || "",
      projectTitle: startup.projectTitle || "",
      founders: startup.founders || "",
      description: startup.description || "",
      category: startup.category || "",
      pitchOrder: startup.pitchOrder?.toString() || "",
    });
  };

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      pitchOrder: Number(form.pitchOrder),
    };

    if (!payload.teamName.trim()) return toast.error("Team name is required");
    if (!Number.isFinite(payload.pitchOrder)) return toast.error("Pitch order must be a number");

    setSaving(true);
    try {
      if (selectedId) {
        await api.put(`/startups/${selectedId}`, payload, authHeaders);
        toast.success("Startup updated");
      } else {
        await api.post("/startups", payload, authHeaders);
        toast.success("Startup added");
      }
      await loadStartups();
      resetForm();
    } catch (err) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await api.delete(`/startups/${selectedId}`, authHeaders);
      toast.success("Startup deleted");
      await loadStartups();
      resetForm();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const onLock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAdminPassword("");
    setLocked(true);
    setPasswordInput("");
    resetForm();
  };

  if (locked) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#fde68a_0%,#f8fafc_35%,#e2e8f0_100%)] text-ink flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white/85 backdrop-blur border border-white shadow-float p-7 animate-pop">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <FiShield size={26} />
          </div>
          <h1 className="font-display text-2xl text-ink mb-1">Special Startup Console</h1>
          <p className="text-sm text-ink-400 mb-5">Enter your special password to manage startup records.</p>

          <form onSubmit={onUnlock} className="space-y-4">
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
              Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0b1120_100%)] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-20 w-72 h-72 bg-amber-400/25 blur-3xl rounded-full" />
        <div className="absolute -bottom-16 -left-12 w-72 h-72 bg-cyan-400/20 blur-3xl rounded-full" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/90 font-semibold">Startup Control Room</p>
            <h1 className="font-display text-xl sm:text-2xl">Special Admin</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <Link to="/special-admin/leaderboard" className="btn-ghost bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs sm:text-sm px-3 py-2">
              Leaderboard
            </Link>
            <button onClick={loadStartups} className="btn-ghost bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs sm:text-sm px-3 py-2">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={onLock} className="btn-ghost bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs sm:text-sm px-3 py-2">
              <FiLock /> Lock
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-6">
        <aside className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/35"
                placeholder="Search team, project, category"
              />
            </div>
          </div>

          <div className="max-h-[38vh] sm:max-h-[65vh] overflow-y-auto">
            {loading ? (
              <div className="p-5 text-sm text-white/70">Loading startups...</div>
            ) : filtered.length === 0 ? (
              <div className="p-5 text-sm text-white/70">No startups match your search.</div>
            ) : (
              filtered.map((s) => {
                const active = s._id === selectedId;
                return (
                  <button
                    key={s._id}
                    onClick={() => selectStartup(s)}
                    className={`w-full text-left px-4 py-3 border-b border-white/10 transition-all ${active ? "bg-amber-200/15" : "hover:bg-white/10"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{s.teamName}</p>
                        <p className="text-xs text-white/60 truncate">{s.projectTitle || "No project title"}</p>
                      </div>
                      <span className="badge bg-white/15 text-white/90">#{s.pitchOrder}</span>
                    </div>
                    <div className="mt-1.5 text-[11px] text-white/55">{s.category || "Uncategorized"}</div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-5 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300/85 font-semibold">{selectedId ? "Edit Mode" : "Create Mode"}</p>
              <h2 className="font-display text-2xl">{selectedId ? "Edit Startup" : "Add Startup"}</h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedId && (
                <button
                  onClick={resetForm}
                  className="btn-ghost bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <FiX /> Cancel Edit
                </button>
              )}
              {selectedId && (
                <button
                  onClick={onDelete}
                  disabled={saving}
                  className="btn-ghost bg-rose-500/20 border-rose-300/30 text-rose-100 hover:bg-rose-500/30"
                >
                  <FiTrash2 /> Delete
                </button>
              )}
            </div>
          </div>

          <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Team Name" required>
              <input
                value={form.teamName}
                onChange={(e) => onChange("teamName", e.target.value)}
                className="input bg-white/5 border-white/20 text-white placeholder:text-white/35"
                placeholder="Team Velocity"
              />
            </Field>

            <Field label="Pitch Order" required>
              <input
                type="number"
                value={form.pitchOrder}
                onChange={(e) => onChange("pitchOrder", e.target.value)}
                className="input bg-white/5 border-white/20 text-white placeholder:text-white/35"
                placeholder="12"
              />
            </Field>

            <Field label="Project Title">
              <input
                value={form.projectTitle}
                onChange={(e) => onChange("projectTitle", e.target.value)}
                className="input bg-white/5 border-white/20 text-white placeholder:text-white/35"
                placeholder="Low-cost smart irrigation"
              />
            </Field>

            <Field label="Category">
              <input
                value={form.category}
                onChange={(e) => onChange("category", e.target.value)}
                className="input bg-white/5 border-white/20 text-white placeholder:text-white/35"
                placeholder="AgriTech"
              />
            </Field>

            <Field label="Founders">
              <input
                value={form.founders}
                onChange={(e) => onChange("founders", e.target.value)}
                className="input bg-white/5 border-white/20 text-white placeholder:text-white/35"
                placeholder="Aditya, Sana"
              />
            </Field>

            <div className="hidden md:block" />

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  className="input resize-none bg-white/5 border-white/20 text-white placeholder:text-white/35"
                  placeholder="Describe the startup vision, product, and target users"
                />
              </Field>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-1 flex-wrap">
              <button className="btn-primary w-full sm:w-auto" disabled={saving}>
                {saving ? <FiRefreshCw className="animate-spin" /> : selectedId ? <FiSave /> : <FiPlus />}
                {selectedId ? "Save Changes" : "Create Startup"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-ghost bg-white/5 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <FiEdit3 /> New Form
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="label text-white/70 mb-2">
        {label} {required ? <span className="text-amber-300">*</span> : null}
      </span>
      {children}
    </label>
  );
}
