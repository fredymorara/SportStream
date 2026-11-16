import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/watch/:matchId" element={<PlayerPage />} />
        <Route
          path="*"
          element={
            <MainLayout>
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
                <h1 className="text-6xl font-black tracking-tight text-accent">
                  404
                </h1>
                <p className="text-lg font-semibold text-ink">
                  Page not found
                </p>
                <p className="max-w-sm text-sm text-muted">
                  The page you were looking for does not exist.
                </p>
                <Link
                  to="/"
                  className="mt-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-black uppercase tracking-wider text-ink-inverse transition-colors hover:bg-accent-hover"
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
