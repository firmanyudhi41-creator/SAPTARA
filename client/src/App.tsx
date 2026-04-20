import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { MapPage } from "./pages/student/MapPage";
import { LogbookPage } from "./pages/student/LogbookPage";
import { CompassPage } from "./pages/student/CompassPage";
import { ShipPage } from "./pages/student/ShipPage";
import { LeaderboardPage } from "./pages/student/LeaderboardPage";
import { FeedPage } from "./pages/teacher/FeedPage";
import { AnalyticsPage } from "./pages/teacher/AnalyticsPage";
import { RewardsPage } from "./pages/teacher/RewardsPage";
import { CrewPage } from "./pages/teacher/CrewPage";

/**
 * App Component
 *
 * Sets up React Router with all student and teacher routes.
 * Protected routes gate access by authentication role.
 */
export function App() {
  return (
    <BrowserRouter>
      <div id="app">
        <div id="page-content" style={{ transition: "opacity 0.15s ease, transform 0.15s ease" }}>
          <Routes>
            {/* Landing / Auth */}
            <Route path="/" element={<LandingPage />} />

            {/* ── Student Routes ── */}
            <Route
              path="/student/map"
              element={
                <ProtectedRoute role="student">
                  <MapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/logbook"
              element={
                <ProtectedRoute role="student">
                  <LogbookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/compass"
              element={
                <ProtectedRoute role="student">
                  <CompassPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/ship"
              element={
                <ProtectedRoute role="student">
                  <ShipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/leaderboard"
              element={
                <ProtectedRoute role="student">
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />

            {/* ── Teacher Routes ── */}
            <Route
              path="/teacher/feed"
              element={
                <ProtectedRoute role="teacher">
                  <FeedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/analytics"
              element={
                <ProtectedRoute role="teacher">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/rewards"
              element={
                <ProtectedRoute role="teacher">
                  <RewardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/crew"
              element={
                <ProtectedRoute role="teacher">
                  <CrewPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
