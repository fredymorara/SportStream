import React from "react";
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
    <div className="min-h-screen w-full bg-black text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]">
        <div className="mx-auto flex min-h-[104px] max-w-[1800px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:min-h-[72px] md:flex-nowrap md:px-8 md:py-0">
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
            className="order-3 flex w-full min-w-0 gap-1 overflow-x-auto md:order-2 md:flex-1 md:justify-center"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedSport === category.id}
                onClick={() => {
                  dispatch(setSelectedSport(category.id));
                  if (location.pathname !== "/") navigate("/");
                }}
                className={`min-h-10 shrink-0 border-b-2 px-3 text-sm font-semibold ${selectedSport === category.id ? "border-emerald-400 text-white" : "border-transparent text-zinc-400 hover:text-white"}`}
              >
                {category.name}
              </button>
            ))}
          </nav>

          <label className="relative order-2 ml-auto block w-[min(42vw,220px)] md:order-3 md:ml-0">
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
              onChange={(event) => {
                dispatch(setSearchQuery(event.target.value));
                if (location.pathname !== "/") navigate("/");
              }}
              placeholder="Search events"
              aria-label="Search events"
              className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
            />
          </label>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="select-none">
          <AdBanner position="top" active={topAdActive} />
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
