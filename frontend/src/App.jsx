import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./lib/AuthContext.jsx";
import LoginPage from "../src/pages/LoginPage.jsx";
import JudgePage from "../src/pages/JudgePage.jsx";
import AdminPage from "../src/pages/AdminPage.jsx";
import SpecialAdminPage from "../src/pages/SpecialAdminPage.jsx";
import SpecialAdminLeaderboardPage from "../src/pages/SpecialAdminLeaderboardPage.jsx";

function ProtectedJudge({ children }) {
  const { judge, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
    </div>
  );
  return judge ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { judge, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={judge ? <Navigate to="/judge" replace /> : <LoginPage />} />
      <Route
        path="/judge"
        element={
          <ProtectedJudge>
            <JudgePage />
          </ProtectedJudge>
        }
      />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/special-admin" element={<SpecialAdminPage />} />
        <Route path="/special-admin/leaderboard" element={<SpecialAdminLeaderboardPage />} />
      <Route path="*" element={<Navigate to={judge ? "/judge" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1C1F28",
              color: "#F7F8FA",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: "#22C55E", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
