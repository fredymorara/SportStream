import React from 'react';
import { Link } from 'react-router-dom';
import FilterBar from './FilterBar';
import type { Sport } from '../services/api';

interface HeaderProps {
  filterProps?: {
    sports: Sport[];
    selectedSport: string;
    onSportChange: (sport: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    showHdOnly: boolean;
    onShowHdOnlyChange: (show: boolean) => void;
    showPopularOnly: boolean;
    onShowPopularOnlyChange: (show: boolean) => void;
    sortBy: 'date' | 'sport';
    onSortByChange: (sortBy: 'date' | 'sport') => void;
    sortOrder: 'asc' | 'desc';
    onSortOrderChange: (order: 'asc' | 'desc') => void;
  };
}

const Header: React.FC<HeaderProps> = ({ filterProps }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/10 shadow-lg text-white p-3 md:p-4 transition-all duration-300">
      <div className="container mx-auto flex flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </div>
          <div className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 whitespace-nowrap">
            SpaceStream
          </div>
        </Link>
        
        <div className="flex-shrink-0">
          {filterProps && <FilterBar {...filterProps} />}
        </div>
      </div>
    </header>
  );
};

export default Header;