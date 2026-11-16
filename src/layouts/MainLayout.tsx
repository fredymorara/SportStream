import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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

interface Category {
  id: CategoryId;
  name: string;
}

const CATEGORIES: Category[] = [
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

const scrollToTop = () => {
  if (typeof window === "undefined") return;
  // No matchMedia means no real layout/scrolling engine (e.g. jsdom in tests).
  if (typeof window.matchMedia !== "function") return;
  const reduced = window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
};

const CategoryIcon: React.FC<{ categoryId: CategoryId }> = ({ categoryId }) => {
  if (categoryId === "home") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" />
      </svg>
    );
  }

  if (categoryId === "basketball") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3v18M5.6 5.6c4.3 2.9 8.5 9.9 12.8 12.8M18.4 5.6C14.1 8.5 9.9 15.5 5.6 18.4" />
      </svg>
    );
  }

  if (categoryId === "baseball") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M7 4.4c3 2 3 13.2 0 15.2M17 4.4c-3 2-3 13.2 0 15.2M5.8 7.1l1.5.8m-1 2.2 1.5.2m-1.5 2 1.5-.2m-1 2.2-1.5.8m12.9-8 .5-.8m-.5 3 .5-.2m-.5 2.2-.5-.2m.5 3 .5.8" />
      </svg>
    );
  }

  if (categoryId === "football") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m12 6 3.5 2.5-1.3 4.1h-4.4L8.5 8.5 12 6Zm-2.2 6.6-3.1 2.3m9.5-2.3 3.1 2.3M8.5 8.5l-3.1-.6m10.1.6 3.1-.6M10 12.6l-1 4.1m5-4.1 1 4.1M8.5 16.7l-2.4 1.1m9.4-1.1 2.4 1.1" />
      </svg>
    );
  }

  if (categoryId === "upcoming") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (categoryId === "other") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 3a9 9 0 0 1 8.2 5.3M3.8 8.3A9 9 0 0 0 4 16m16-1a9 9 0 0 1-6.2 5.7" />
    </svg>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  const bottomNavRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, selectedSport } = useAppSelector(
    (state) => state.matches,
  );

  useEffect(() => {
    const urlSport = searchParams.get("sport") || "all";
    const urlQuery = searchParams.get("q") || "";
    if (urlSport !== selectedSport) dispatch(setSelectedSport(urlSport));
    if (urlQuery !== searchQuery) dispatch(setSearchQuery(urlQuery));
  }, [dispatch, searchParams, selectedSport, searchQuery]);

  // Keep the active phone-tab in view when the category changes or deep-linked.
  useEffect(() => {
    const container = bottomNavRef.current;
    if (!container || typeof container.scrollTo !== "function") return;
    const activeButton = container.querySelector<HTMLButtonElement>(
      '[data-active="true"]',
    );
    if (!activeButton) return;
    const left =
      activeButton.offsetLeft - (container.clientWidth - activeButton.clientWidth) / 2;
    container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [selectedSport]);

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
    if (location.pathname !== "/") navigate("/");
    scrollToTop();
  };

  const goHome = () => {
    dispatch(setSelectedSport("all"));
    dispatch(setSearchQuery(""));
    setSearchParams({}, { replace: true });
    scrollToTop();
  };

  const updateSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    updateUrl(selectedSport, query);
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

  return (
    <div className="relative min-h-screen w-full bg-pitch text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, .66), rgba(0, 0, 0, .82)), url('/sports_placeholder.png')",
        }}
      />
      <header className="sticky top-0 z-40 border-b border-border bg-pitch/98 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-14 items-center justify-between gap-2 lg:h-[72px] lg:gap-4">
            <Link
              to="/"
              onClick={goHome}
              aria-label="SportStream home"
              className="flex shrink-0 items-center gap-2.5 text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded bg-accent text-ink-inverse">
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
              <span className="hidden text-lg font-black sm:inline">
                SportStream
              </span>
            </Link>

            {/* Desktop: full category nav in the header */}
            <nav
              aria-label="Sports categories"
              className="hidden min-w-0 flex-1 justify-center gap-1 lg:flex"
            >
              {CATEGORIES.map((category) => {
                const active = isCategoryActive(category.id, selectedSport);
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-label={category.name}
                    aria-current={active ? "page" : undefined}
                    title={category.name}
                    onClick={() => selectCategory(category.id)}
                    className={`flex min-h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors ${
                      active
                        ? "border-accent text-white"
                        : "border-transparent text-muted hover:text-white"
                    }`}
                  >
                    <span className="h-4 w-4">
                      <CategoryIcon categoryId={category.id} />
                    </span>
                    {category.name}
                  </button>
                );
              })}
            </nav>

            <label className="relative block min-w-0 flex-1 lg:hidden">
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
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search events"
                aria-label="Search events"
                className="search-input h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-white placeholder:text-muted transition-colors focus:border-white/30 focus:bg-white/[0.08] focus:outline-none"
              />
            </label>

            <label className="relative hidden w-[min(24vw,220px)] shrink-0 lg:block">
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
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search events"
                aria-label="Search events"
                className="search-input h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-white placeholder:text-muted transition-colors focus:border-white/30 focus:bg-white/[0.08] focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={installApp}
              aria-label="Install SportStream"
              title="Install SportStream"
              className={`${installPrompt ? "flex" : "hidden"} h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent`}
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

          {/* Tablet: labelled category strip in the header */}
          <nav
            aria-label="Sports categories"
            className="mobile-category-nav hidden grid-cols-7 border-t border-border pt-1 sm:grid lg:hidden"
          >
            {CATEGORIES.map((category) => {
              const active = isCategoryActive(category.id, selectedSport);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-label={category.name}
                  aria-current={active ? "page" : undefined}
                  title={category.name}
                  onClick={() => selectCategory(category.id)}
                  className={`flex min-h-14 min-w-0 touch-manipulation flex-col items-center justify-center gap-1 border-b-2 px-1 transition-colors focus-visible:bg-white/10 ${
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-transparent text-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="h-5 w-5 shrink-0">
                    <CategoryIcon categoryId={category.id} />
                  </span>
                  <span className="max-w-full truncate text-[11px] font-semibold leading-none">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Phone: fixed, labelled category bar in thumb reach */}
      <nav
        aria-label="Sports categories"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-pitch/95 shadow-[0_-8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md sm:hidden"
      >
        <div
          ref={bottomNavRef}
          className="hide-scrollbar relative flex snap-x snap-mandatory gap-1 overflow-x-auto px-2 pt-1"
          style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
        >
          {CATEGORIES.map((category) => {
            const active = isCategoryActive(category.id, selectedSport);
            return (
              <button
                key={category.id}
                type="button"
                data-active={active}
                aria-label={category.name}
                aria-current={active ? "page" : undefined}
                title={category.name}
                onClick={() => selectCategory(category.id)}
                className={`relative flex min-w-[64px] shrink-0 snap-center flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors focus-visible:bg-white/10 ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted active:bg-white/5"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-0 h-[3px] w-7 -translate-x-1/2 rounded-full bg-accent"
                  />
                )}
                <span className="h-[22px] w-[22px] shrink-0">
                  <CategoryIcon categoryId={category.id} />
                </span>
                <span className="max-w-full truncate text-[11px] font-semibold leading-none">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="relative z-10 mx-auto w-full max-w-[1800px] px-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pb-6 sm:pt-6 lg:px-10 lg:pb-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
