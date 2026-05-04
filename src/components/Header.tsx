import React from 'react';
import { Link } from 'react-router-dom';
import FilterBar from './FilterBar';

interface HeaderProps {
  filterProps?: {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    selectedSport: string;
    onSportChange: (sport: string) => void;
  };
}

const Header: React.FC<HeaderProps> = ({ filterProps }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/75 backdrop-blur-md border-b border-white/10 shadow-lg text-white p-3 sm:p-4 transition-all duration-300">
      <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* Branding Logo Section */}
        <div className="flex items-center justify-center lg:justify-start w-full ml-10 lg:w-auto">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
            <div className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 whitespace-nowrap select-none">
              Mpira streams
            </div>
          </Link>
        </div>
        
        {/* Toolbar Components */}
        <div className="w-full lg:w-auto flex-shrink-0">
          {filterProps && <FilterBar {...filterProps} />}
        </div>
      </div>
    </header>
  );
};

export default Header;