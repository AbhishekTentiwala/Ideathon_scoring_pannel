import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api.js";
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [judge, setJudge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sk_token");
    if (token) {
      api.get("/auth/me")
        .then(({ judge }) => setJudge(judge))
        .catch(() => localStorage.removeItem("sk_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { token, judge } = await api.post("/auth/login", { email: normalizedEmail, password });
    localStorage.setItem("sk_token", token);
    setJudge(judge);
    return judge;
  };

  const logout = () => {
    localStorage.removeItem("sk_token");
    setJudge(null);
  };

  return (
    <AuthCtx.Provider value={{ judge, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
