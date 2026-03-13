import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../lib/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/judge");
    } catch (err) {
      if (err?.code === "ERR_NETWORK") {
        toast.error("Cannot reach the backend server on port 4000.");
      } else {
        toast.error(err?.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fc] relative overflow-hidden px-4 py-8 sm:py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-28 -left-24 w-[500px] h-[500px] rounded-full opacity-70"
          style={{ background: "radial-gradient(circle, rgba(0,58,140,0.18) 0%, rgba(0,58,140,0) 68%)" }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-[460px] h-[460px] rounded-full opacity-80"
          style={{ background: "radial-gradient(circle, rgba(234,112,11,0.17) 0%, rgba(234,112,11,0) 70%)" }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl rounded-[28px] border border-ink-100 bg-white shadow-float overflow-hidden animate-fade-up opacity-0 [animation-fill-mode:forwards]">
        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden md:flex flex-col justify-between bg-gradient-to-b from-brand to-brand-dark p-10 text-white">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Startup Khumb 2026
              </p>
              <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight">
                Ideathon
                <br />
                Evaluation Portal
              </h1>
              <p className="mt-4 max-w-sm text-sm text-white/80 leading-relaxed">
                Secure access for judges to evaluate startups with consistency, speed, and transparent score tracking.
              </p>
            </div>

            <div className="space-y-3 text-sm text-white/85">
              <p className="font-semibold">Trusted by ECELL NITA and DST i-TBI</p>
              <p className="text-white/70">One panel. One framework. Real-time decisions.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8 md:p-10 lg:p-12 bg-white">
            <div className="max-w-md mx-auto">
              <div className="mb-7 sm:mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand/70 mb-2">Judge Access</p>
                <h2 className="text-2xl sm:text-[28px] font-display font-bold text-ink tracking-tight">Sign in to continue</h2>
                <p className="text-sm text-ink-400 mt-2">Use your assigned judge credentials to access the scoring dashboard.</p>
                
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 text-sm" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="judge@khumb.in"
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 text-sm" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="input pl-10 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600 transition-colors"
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white transition-all duration-200 shadow-brand hover:bg-brand-dark hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-ink-400">ECELL NITA · DST i-TBI</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
