import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import PortfolioHome from "./PortfolioHome";
import { trackAccess, trackDuration } from "./lib/analytics";
import { ThemeProvider } from "./lib/theme";

const ProjectDetail  = lazy(() => import("./ProjectDetail"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));

// ============================================
// COMPONENTE PRINCIPAL: APP
// Gerencia as rotas da aplicação.
// ============================================

export default function App() {
  useEffect(() => {
    // Track initial access
    trackAccess();

    // Track session duration on unload
    const startTime = Date.now();
    const handleUnload = () => {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      if (durationSeconds > 0) {
        trackDuration(durationSeconds);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/"            element={<PortfolioHome />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/admin"        element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}
