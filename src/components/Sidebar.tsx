import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSelectedSport, setSearchQuery } from "../store/matchesSlice";

interface SidebarProps {
  filterProps?: any; // Kept for backwards compatibility if needed, but ignored
}

const sportCategories = [
  {
    id: "all",
    name: "All Sports",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    id: "live",
    name: "Live Now",
    icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-5 0 2 .5 3.5 1 4 1-1 1-3 1.5-4 0 2 2 3.5 2.5 4 2-1.5 2-3 2-5 0 3.5-1 6.5-2.5 8.5z",
  },
  {
    id: "football",
    name: "Football",
    icon: "M12 3v3m0 12v3M3 12h3m12 0h3m-4.5-4.5l-2 2m-5 5l-2 2m0-9l2 2m5 5l2 2",
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "M5 12h14M12 5c3 0 5 3.5 5 7s-2 7-5 7-5-3.5-5-7 2-7 5-7z",
  },
  {
    id: "american_football",
    name: "NFL / Am. Football",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    id: "baseball",
    name: "Baseball",
    icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M15 9s-2-2-4-2-4 2-4 2 M15 15s-2 2-4 2-4-2-4-2",
  },
  { id: "hockey", name: "Hockey", icon: "M3 21l18-18 M12 21l9-9" },
  {
    id: "motor_sports",
    name: "Motor Sports",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    id: "fight",
    name: "Fighting",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.5a4.5 4.5 0 116.364-6.364",
  },
  {
    id: "rugby",
    name: "Rugby",
    icon: "M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z",
  },
  {
    id: "golf",
    name: "Golf",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
  },
  {
    id: "cricket",
    name: "Cricket",
    icon: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z",
  },
];

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { searchQuery, selectedSport } = useAppSelector(
    (state) => state.matches,
  );
  const sports = useAppSelector((state) => state.sports.list);

  const categories = [
    { id: "all", name: "All Sports", icon: sportCategories[0].icon },
    { id: "live", name: "Live Now", icon: sportCategories[1].icon },
    ...sports.map((sport) => ({
      id: sport.name.toLowerCase(),
      name: sport.name,
      icon: "M12 3v18m9-9H3",
    })),
  ];

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
    if (location.pathname !== "/") navigate("/");
  };

  const handleSportChange = (sportId: string) => {
    dispatch(setSelectedSport(sportId));
    if (location.pathname !== "/") navigate("/");
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[#09090b] border-r border-white/5 h-screen flex flex-col">
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <svg
              className="w-5 h-5 text-black"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            SportStream
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
        {/* Search */}
        <div className="relative">
          <svg
            className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search streams..."
            className="w-full bg-zinc-900 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
            Discover
          </h3>
          <div className="space-y-1">
            {categories.map((sport) => (
              <button
                key={sport.id}
                onClick={() => handleSportChange(sport.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  selectedSport === sport.id
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent"
                }`}
              >
                <svg
                  className="w-5 h-5 opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {sport.id === "football" ||
                  sport.id === "basketball" ||
                  sport.id === "tennis" ||
                  sport.id === "baseball" ? (
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  ) : null}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={sport.icon}
                  />
                </svg>
                {sport.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
