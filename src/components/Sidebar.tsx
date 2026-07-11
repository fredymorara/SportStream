import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedSport, setSearchQuery } from '../store/matchesSlice';

interface SidebarProps {
  filterProps?: any; // Kept for backwards compatibility if needed, but ignored
}

const sportCategories = [
  { id: 'all', name: 'All Sports', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'popular_live', name: 'Popular Live', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-5 0 2 .5 3.5 1 4 1-1 1-3 1.5-4 0 2 2 3.5 2.5 4 2-1.5 2-3 2-5 0 3.5-1 6.5-2.5 8.5z' },
  { id: 'football', name: 'Football', icon: 'M12 3v3m0 12v3M3 12h3m12 0h3m-4.5-4.5l-2 2m-5 5l-2 2m0-9l2 2m5 5l2 2' },
  { id: 'basketball', name: 'Basketball', icon: 'M5 12h14M12 5c3 0 5 3.5 5 7s-2 7-5 7-5-3.5-5-7 2-7 5-7z' }
];

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { searchQuery, selectedSport } = useAppSelector((state) => state.matches);

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
    if (location.pathname !== '/') navigate('/');
  };

  const handleSportChange = (sportId: string) => {
    dispatch(setSelectedSport(sportId));
    if (location.pathname !== '/') navigate('/');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[#09090b] border-r border-white/5 h-screen flex flex-col">
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
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
          <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">Discover</h3>
          <div className="space-y-1">
            {sportCategories.map((sport) => (
              <button
                key={sport.id}
                onClick={() => handleSportChange(sport.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  selectedSport === sport.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {sport.id === 'football' || sport.id === 'basketball' ? (
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  ) : null}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sport.icon} />
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
