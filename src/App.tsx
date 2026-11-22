import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<HomePage />} />
        <Route path="/watch/:matchId" element={<PlayerPage />} />
        <Route
          path="*"
          element={
            <MainLayout>
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
                <span className="sig-stamp bg-live-badge px-3 py-1 text-xs text-white">
                  Off air
                </span>
                <h1 className="font-display text-7xl font-extrabold leading-none text-accent">
                  404
                </h1>
                <p className="font-display text-xl font-bold uppercase text-ink">
                  Page not found
                </p>
                <p className="max-w-sm text-sm text-muted">
                  The page you were looking for does not exist.
                </p>
                <Link
                  to="/app"
                  className="sig-stamp mt-2 bg-accent px-6 py-3 text-sm text-ink-inverse hover:bg-accent-hover"
                >
                  Back to events
                </Link>
              </div>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
