import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSearchQuery, setSelectedSport } from "../store/matchesSlice";
import AdBanner from "../components/AdBanner";

interface MainLayoutProps {
  children: React.ReactNode;
  topAdActive?: boolean;
  fullViewport?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  topAdActive = false,
  fullViewport = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, selectedSport } = useAppSelector(
    (state) => state.matches,
  );
  const categories = [
    { id: "live", name: "Live Now" },
    { id: "basketball", name: "Basketball" },
    { id: "baseball", name: "Baseball" },
    { id: "football", name: "Football" },
    { id: "other", name: "Others" },
  ];

  const selectCategory = (categoryId: string) => {
    dispatch(setSelectedSport(categoryId));
    setMobileMenuOpen(false);
    if (location.pathname !== "/") navigate("/");
  };

  const updateSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    if (location.pathname !== "/") navigate("/");
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
          <div className="flex h-16 items-center justify-between gap-3 md:h-[72px]">
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
              <span className="text-lg font-black">SportStream</span>
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
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/10 text-white lg:hidden"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div
              id="mobile-navigation"
              className="border-t border-white/10 py-4 lg:hidden"
            >
              <nav
                aria-label="Sports categories"
                className="grid grid-cols-2 gap-2"
              >
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={selectedSport === category.id}
                    onClick={() => selectCategory(category.id)}
                    className={`min-h-11 rounded-md border px-3 text-left text-sm font-semibold ${selectedSport === category.id ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/5 text-zinc-300"}`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>
              <label className="relative mt-3 block">
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
                  className="h-11 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
              </label>
            </div>
          )}
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
