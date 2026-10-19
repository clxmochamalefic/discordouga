import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";

export const App = () => {
  const auth = useAuth();

  if (auth.state.status === "loading") {
    return <div className="center">Loading…</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home authed={auth.state.status === "authed"} />} />
      <Route
        path="/dashboard"
        element={
          auth.state.status === "authed" ? (
            <Dashboard user={auth.state.user} onLogout={auth.logout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
