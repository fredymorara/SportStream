import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  filterProps?: {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    selectedSport: string;
    onSportChange: (sport: string) => void;
  };
}

const sportIcons = [
  {
    id: 'all',
    name: 'All Sports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  {
    id: 'popular_live',
    name: 'Popular Live',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-5 0 2 .5 3.5 1 4 1-1 1-3 1.5-4 0 2 2 3.5 2.5 4 2-1.5 2-3 2-5 0 3.5-1 6.5-2.5 8.5z" />
      </svg>
    )
  },
  {
    id: 'football',
    name: 'Football',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v3m0 12v3M3 12h3m12 0h3m-4.5-4.5l-2 2m-5 5l-2 2m0-9l2 2m5 5l2 2" />
      </svg>
    )
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5c3 0 5 3.5 5 7s-2 7-5 7-5-3.5-5-7 2-7 5-7z" />
      </svg>
    )
  }
];

const Header: React.FC<HeaderProps> = ({ filterProps }) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Extract from filterProps
  const {
    searchQuery = '',
    onSearchQueryChange = () => {},
    selectedSport = 'all',
    onSportChange = () => {}
  } = filterProps || {};

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-4 border border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        {/* Brand */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group relative z-20">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <svg className="w-6 h-6 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter text-white hidden sm:block">
            SPORT<span className="text-emerald-400">STREAM</span>
          </span>
        </Link>

        {/* Unified Search & Filters */}
        <div className="flex-1 flex justify-end items-center gap-2">
          {/* Naked Category Icons */}
          <div className="flex items-center gap-4 sm:gap-5 mr-2 sm:mr-4">
            {sportIcons.map((sport) => (
              <button
                key={sport.id}
                onClick={() => onSportChange(sport.id)}
                title={sport.name}
                className={`transition-all duration-300 flex items-center justify-center cursor-pointer hover-spring ${
                  selectedSport === sport.id
                    ? 'text-emerald-400 scale-[1.3] drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] z-10'
                    : 'text-slate-400 hover:text-white hover:scale-110'
                }`}
              >
                {sport.icon}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 mx-1 sm:mx-2 flex-shrink-0"></div>

          {/* Collapsible Search */}
          <div 
            className={`relative flex items-center bg-white/5 rounded-full transition-all duration-500 ease-in-out flex-shrink-0 ${
              isSearchExpanded || searchQuery ? 'w-48 sm:w-56 px-4 py-2.5 ring-1 ring-emerald-500/50 bg-white/10' : 'w-10 h-10 justify-center cursor-pointer hover:bg-white/15'
            }`}
            onClick={() => {
              if (!isSearchExpanded && !searchQuery) setIsSearchExpanded(true);
            }}
          >
            <svg 
              className={`w-4 h-4 transition-colors flex-shrink-0 ${isSearchExpanded || searchQuery ? 'text-emerald-400 mr-2' : 'text-slate-400'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
              onClick={(e) => {
                if (isSearchExpanded && !searchQuery) {
                  e.stopPropagation();
                  setIsSearchExpanded(false);
                }
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {(isSearchExpanded || searchQuery) && (
              <input
                type="text"
                autoFocus={isSearchExpanded}
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setIsSearchExpanded(false);
                }}
                placeholder="Search..."
                className="bg-transparent border-none text-slate-100 placeholder-slate-400 focus:outline-none w-full text-xs font-bold tracking-wide"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;