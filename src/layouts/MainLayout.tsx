import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSearchQuery, setSelectedSport } from "../store/matchesSlice";
import AdBanner from "../components/AdBanner";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface MainLayoutProps {
  children: React.ReactNode;
  topAdActive?: boolean;
  fullViewport?: boolean;
}

type CategoryId = "live" | "basketball" | "baseball" | "football" | "other";

const CategoryIcon: React.FC<{ categoryId: CategoryId }> = ({ categoryId }) => {
  if (categoryId === "basketball") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3v18M5.6 5.6c4.3 2.9 8.5 9.9 12.8 12.8M18.4 5.6C14.1 8.5 9.9 15.5 5.6 18.4" />
      </svg>
    );
  }

  if (categoryId === "baseball") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M7 4.4c3 2 3 13.2 0 15.2M17 4.4c-3 2-3 13.2 0 15.2M5.8 7.1l1.5.8m-1 2.2 1.5.2m-1.5 2 1.5-.2m-1 2.2-1.5.8m12.9-8 .5-.8m-.5 3 .5-.2m-.5 2.2-.5-.2m.5 3 .5.8" />
      </svg>
    );
  }

  if (categoryId === "football") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m12 6 3.5 2.5-1.3 4.1h-4.4L8.5 8.5 12 6Zm-2.2 6.6-3.1 2.3m9.5-2.3 3.1 2.3M8.5 8.5l-3.1-.6m10.1.6 3.1-.6M10 12.6l-1 4.1m5-4.1 1 4.1M8.5 16.7l-2.4 1.1m9.4-1.1 2.4 1.1" />
      </svg>
    );
  }

  if (categoryId === "other") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 3a9 9 0 0 1 8.2 5.3M3.8 8.3A9 9 0 0 0 4 16m16-1a9 9 0 0 1-6.2 5.7" />
    </svg>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  topAdActive = false,
  fullViewport = false,
}) => {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, selectedSport } = useAppSelector(
    (state) => state.matches,
  );
  const categories = [
    { id: "live" as const, name: "Live Now" },
    { id: "basketball" as const, name: "Basketball" },
    { id: "baseball" as const, name: "Baseball" },
    { id: "football" as const, name: "Football" },
    { id: "other" as const, name: "Others" },
  ];

  const selectCategory = (categoryId: string) => {
    dispatch(setSelectedSport(categoryId));
    if (location.pathname !== "/") navigate("/");
  };

  const updateSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    if (location.pathname !== "/") navigate("/");
  };

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  if (fullViewport) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden bg-black text-slate-100">
        <main className="h-full w-full min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, .66), rgba(0, 0, 0, .82)), url('/sports_placeholder.png')",
        }}
      />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]">
        <div className="mx-auto max-w-[1800px] px-4 md:px-8">
          <div className="flex h-14 items-center justify-between gap-2 lg:h-[72px] lg:gap-4">
            <Link
              to="/"
              className="flex shrink-0 items-center gap-2.5 text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded bg-emerald-400 text-black">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </span>
              <span className="hidden text-lg font-black sm:inline">SportStream</span>
            </Link>

            <nav
              aria-label="Sports categories"
              className="hidden min-w-0 flex-1 justify-center gap-1 lg:flex"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={selectedSport === category.id}
                  onClick={() => selectCategory(category.id)}
                  className={`min-h-10 shrink-0 border-b-2 px-3 text-sm font-semibold ${selectedSport === category.id ? "border-emerald-400 text-white" : "border-transparent text-zinc-400 hover:text-white"}`}
                >
                  {category.name}
                </button>
              ))}
            </nav>

            <label className="relative block min-w-0 flex-1 lg:hidden">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.3-4.3m1.3-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search events"
                aria-label="Search events"
                className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
              />
            </label>

            <label className="relative hidden w-[min(24vw,220px)] shrink-0 lg:block">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.3-4.3m1.3-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search events"
                aria-label="Search events"
                className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={installApp}
              aria-label="Install SportStream"
              title="Install SportStream"
              className={`${installPrompt ? "flex" : "hidden"} h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-400/40 bg-emerald-400/10 text-emerald-300`}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
              </svg>
            </button>

          </div>

          <nav
            aria-label="Sports categories"
            className="grid grid-cols-5 border-t border-white/10 py-1 lg:hidden"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-label={category.name}
                aria-pressed={selectedSport === category.id}
                onClick={() => selectCategory(category.id)}
                className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 ${selectedSport === category.id ? "text-emerald-300" : "text-zinc-400"}`}
              >
                <span className="h-5 w-5">
                  <CategoryIcon categoryId={category.id} />
                </span>
                <span className="max-w-full truncate text-[9px] font-semibold leading-none">
                  {category.name}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="select-none">
          <AdBanner position="top" active={topAdActive} />
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
