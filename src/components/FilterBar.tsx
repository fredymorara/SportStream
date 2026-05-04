import React, { useState } from 'react';
import type { Sport } from '../services/api';

interface FilterBarProps {
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
}

const FilterBar: React.FC<FilterBarProps> = ({
  sports,
  selectedSport,
  onSportChange,
  selectedStatus,
  onStatusChange,
  showHdOnly,
  onShowHdOnlyChange,
  showPopularOnly,
  onShowPopularOnlyChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative">
      <div className="2xl:hidden flex z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-xl text-emerald-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} 2xl:flex flex-col 2xl:flex-row absolute 2xl:relative right-0 top-full 2xl:top-auto z-50 bg-slate-900 2xl:bg-transparent p-4 2xl:p-0 rounded-xl border border-white/10 2xl:border-none shadow-2xl 2xl:shadow-none items-stretch 2xl:items-center gap-4 text-xs mt-4 2xl:mt-0 min-w-[280px] 2xl:min-w-max`}>
        
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/50 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => onSportChange('all')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
              selectedSport === 'all' 
                ? 'bg-emerald-500 text-slate-900 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            All
          </button>
          {sports.slice(0, 4).map((sport) => (
            <button
              key={sport.id}
              onClick={() => onSportChange(sport.name.toLowerCase())}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                selectedSport === sport.name.toLowerCase()
                  ? 'bg-emerald-500 text-slate-900 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {sport.name}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-white/10 hidden 2xl:block"></div>

        <select
          id="status-filter"
          className="appearance-none bg-slate-800/80 hover:bg-slate-700/80 text-white border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Any Status</option>
          <option value="live">Live Now</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
        </select>

        <div className="h-8 w-px bg-white/10 hidden 2xl:block"></div>

        <div className="flex items-center gap-4 bg-slate-800/50 p-1.5 px-3 rounded-xl border border-white/5 whitespace-nowrap">
          <label className="flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showHdOnly} 
              onChange={(e) => onShowHdOnlyChange(e.target.checked)} 
            />
            <div className={`block w-8 h-5 rounded-full transition-colors duration-300 ${showHdOnly ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
            <div className="ml-1.5 text-slate-300 group-hover:text-white transition-colors">HD</div>
          </label>

          <label className="flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showPopularOnly} 
              onChange={(e) => onShowPopularOnlyChange(e.target.checked)} 
            />
            <div className={`block w-8 h-5 rounded-full transition-colors duration-300 ${showPopularOnly ? 'bg-pink-500' : 'bg-slate-700'}`}></div>
            <div className="ml-1.5 text-slate-300 group-hover:text-white transition-colors">Hot</div>
          </label>
        </div>

        <div className="h-8 w-px bg-white/10 hidden 2xl:block"></div>

        <div className="flex items-center gap-2">
          <select
            id="sort-by"
            className="appearance-none bg-slate-800/80 hover:bg-slate-700/80 text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'date' | 'sport')}
          >
            <option value="date">Sort: Date</option>
            <option value="sport">Sort: Sport</option>
          </select>

          {sortBy === 'date' && (
            <button
               onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
               className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-xl text-emerald-400 transition-colors"
            >
              <svg className={`h-4 w-4 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;