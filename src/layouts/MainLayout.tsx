import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSearchQuery, setSelectedSport } from "../store/matchesSlice";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

type CategoryId =
  | "home"
  | "live"
  | "upcoming"
  | "basketball"
  | "baseball"
  | "football"
  | "other";

const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: "home", name: "Home" },
  { id: "football", name: "Football" },
  { id: "live", name: "Live Now" },
  { id: "upcoming", name: "Upcoming" },
  { id: "basketball", name: "Basketball" },
  { id: "baseball", name: "Baseball" },
  { id: "other", name: "Others" },
];

const isCategoryActive = (id: CategoryId, sport: string) =>
  id === "home" ? sport === "all" : sport === id;

/** The sports tab names where you are, not a generic "home". */
const sportTabLabel = (sport: string) => {
  if (sport === "all" || sport === "live") return "sports";
  return (CATEGORIES.find((category) => category.id === sport)?.name ?? "sports").toLowerCase();
};

const scrollToTop = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
};

const SearchField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}> = ({ value, onChange, className = "", inputRef }) => (
  <label className={`relative block min-w-0 ${className}`}>
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
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
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search teams, competitions"
      aria-label="Search events"
      className="search-input h-11 w-full border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted"
    />
  </label>
);

const CloseIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
  </svg>
);

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [panel, setPanel] = useState<"sports" | "search" | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sportsPanelRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, selectedSport } = useAppSelector((state) => state.matches);

  const appPath = location.pathname === "/" ? "/" : "/app";

  useEffect(() => {
    const urlSport = searchParams.get("sport") || "all";
    const urlQuery = searchParams.get("q") || "";
    if (urlSport !== selectedSport) dispatch(setSelectedSport(urlSport));
    if (urlQuery !== searchQuery) dispatch(setSearchQuery(urlQuery));
  }, [dispatch, searchParams, selectedSport, searchQuery]);

  useEffect(() => {
    if (!panel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKeyDown);
    if (panel === "search") searchInputRef.current?.focus();
    if (panel === "sports") sportsPanelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panel]);

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

  const updateUrl = (sport: string, query: string) => {
    const nextParams = new URLSearchParams();
    if (sport !== "all") nextParams.set("sport", sport);
    if (query.trim()) nextParams.set("q", query.trim());
    setSearchParams(nextParams, { replace: true });
  };

  const selectCategory = (categoryId: string) => {
    const nextSport = categoryId === "home" ? "all" : categoryId;
    dispatch(setSelectedSport(nextSport));
    updateUrl(nextSport, searchQuery);
    if (location.pathname !== appPath) navigate(appPath);
    setPanel(null);
    scrollToTop();
  };

  const goHome = () => {
    dispatch(setSelectedSport("all"));
    dispatch(setSearchQuery(""));
    setSearchParams({}, { replace: true });
    if (location.pathname !== appPath) navigate(appPath);
    setPanel(null);
    scrollToTop();
  };

  const updateSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    updateUrl(selectedSport, query);
    if (location.pathname !== appPath) navigate(appPath);
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const tabClass = (active: boolean, compact = false) =>
    [
      "sig-stamp flex shrink-0 items-center justify-center border-b-2 transition-colors",
      compact ? "min-h-14 flex-col gap-1 px-2 text-xs" : "min-h-11 px-3 text-sm",
      active
        ? "border-accent bg-surface text-accent"
        : "border-transparent text-muted hover:text-ink",
    ].join(" ");

  const mobileTabClass = (active: boolean) =>
    [
      "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 border-t-2 px-1 py-2",
      "font-display text-sm font-semibold lowercase tracking-tight transition-colors",
      active
        ? "border-accent bg-surface text-accent"
        : "border-transparent text-muted",
    ].join(" ");

  const panelClass = "mobile-panel sm:hidden";

  return (
    <div className="relative min-h-screen w-full bg-pitch text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:text-ink-inverse"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-pitch/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-14 items-center gap-3 lg:h-[72px] lg:gap-6">
            <Link
              to={appPath}
              onClick={goHome}
              aria-label="SportStream home"
              className="flex shrink-0 items-center gap-2.5 text-ink"
            >
              <span aria-hidden="true" className="h-3 w-3 bg-signal" />
              <span className="font-display text-2xl font-extrabold lowercase tracking-tight sm:text-3xl">
                sportstream
              </span>
            </Link>

            <nav
              aria-label="Sports categories"
              className="hidden min-w-0 flex-1 items-center justify-center gap-0 lg:flex"
            >
              {CATEGORIES.map((category) => {
                const active = isCategoryActive(category.id, selectedSport);
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-label={category.name}
                    aria-current={active ? "page" : undefined}
                    onClick={() => selectCategory(category.id)}
                    className={tabClass(active)}
                  >
                    {category.name}
                  </button>
                );
              })}
            </nav>

            <SearchField
              value={searchQuery}
              onChange={updateSearch}
              className="hidden flex-1 sm:block lg:max-w-[260px]"
            />

            {installPrompt && (
              <button
                type="button"
                onClick={installApp}
                aria-label="Install SportStream"
                title="Install SportStream"
                className="hidden h-11 w-11 shrink-0 items-center justify-center border border-accent/40 text-accent sm:flex"
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
            )}
          </div>

          <nav
            aria-label="Sports categories"
            className="mobile-category-nav hidden grid-cols-7 border-t border-border sm:grid lg:hidden"
          >
            {CATEGORIES.map((category) => {
              const active = isCategoryActive(category.id, selectedSport);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-label={category.name}
                  aria-current={active ? "page" : undefined}
                  onClick={() => selectCategory(category.id)}
                  className={tabClass(active, true)}
                >
                  {category.name}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {panel === "sports" && (
        <div id="mobile-sports-panel" ref={sportsPanelRef} className={panelClass}>
          <div className="flex items-center justify-between gap-3">
            <p className="sig-stamp text-xs text-muted">Choose a sport</p>
            <button
              type="button"
              onClick={() => setPanel(null)}
              aria-label="Close sport list"
              className="flex h-11 w-11 items-center justify-center border border-border text-muted"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CATEGORIES.map((category) => {
              const active = isCategoryActive(category.id, selectedSport);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  aria-current={active ? "page" : undefined}
                  className={`sig-stamp min-h-11 border px-3 text-left text-xs ${
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface text-ink"
                  }`}
                >
                  {category.id === "home" ? "All sports" : category.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {panel === "search" && (
        <div id="mobile-search-panel" className={panelClass}>
          <div className="flex items-center gap-2">
            <SearchField
              value={searchQuery}
              onChange={updateSearch}
              inputRef={searchInputRef}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setPanel(null)}
              aria-label="Close search"
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-border text-muted"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-border bg-pitch/98 backdrop-blur-sm sm:hidden"
      >
        <button
          type="button"
          onClick={() => setPanel((current) => (current === "sports" ? null : "sports"))}
          aria-expanded={panel === "sports"}
          aria-controls={panel === "sports" ? "mobile-sports-panel" : undefined}
          aria-label={`Change sport, currently ${sportTabLabel(selectedSport)}`}
          className={mobileTabClass(panel === "sports" || (selectedSport !== "all" && selectedSport !== "live"))}
        >
          <span className="max-w-full truncate">{sportTabLabel(selectedSport)}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setPanel(null);
            selectCategory("live");
          }}
          aria-current={selectedSport === "live" && !panel ? "page" : undefined}
          className={mobileTabClass(selectedSport === "live" && !panel)}
        >
          live
        </button>
        <button
          type="button"
          onClick={() => setPanel((current) => (current === "search" ? null : "search"))}
          aria-expanded={panel === "search"}
          aria-controls={panel === "search" ? "mobile-search-panel" : undefined}
          className={mobileTabClass(panel === "search")}
        >
          search
        </button>
      </nav>

      <main id="main-content" className="relative mx-auto w-full max-w-[1800px] px-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-8 lg:px-10 lg:pt-7">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
