import React from 'react';

interface FilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedSport: string;
  onSportChange: (sport: string) => void;
}

const sportIcons = [
  {
    id: 'all',
    name: 'All Sports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  {
    id: 'popular_live',
    name: 'Popular Live',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-5 0 2 .5 3.5 1 4 1-1 1-3 1.5-4 0 2 2 3.5 2.5 4 2-1.5 2-3 2-5 0 3.5-1 6.5-2.5 8.5z" />
      </svg>
    )
  },
  {
    id: 'football',
    name: 'Football',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v3m0 12v3M3 12h3m12 0h3m-4.5-4.5l-2 2m-5 5l-2 2m0-9l2 2m5 5l2 2" />
      </svg>
    )
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5c3 0 5 3.5 5 7s-2 7-5 7-5-3.5-5-7 2-7 5-7z" />
      </svg>
    )
  },
  {
    id: 'hockey',
    name: 'Hockey',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 4l3 14h3m8-14l-3 14h-3m-6 0h12" />
      </svg>
    )
  },
  {
    id: 'baseball',
    name: 'Baseball',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4s-4 4-4 8 4 8 4 8m-8-16s4 4 4 8-4 8-4 8" />
      </svg>
    )
  },
  {
    id: 'motor_sports',
    name: 'Motor Sports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <circle cx="12" cy="12" r="2.5" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v6.5m-6.36 9l4.86-3.15m7.86 3.15l-4.86-3.15" />
      </svg>
    )
  },
  {
    id: 'fight',
    name: 'Fight (UFC, Boxing)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="9" cy="9" r="6" strokeWidth="2" />
        <circle cx="15" cy="15" r="6" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13L19 19m-5 0l-6-6" />
      </svg>
    )
  },
  {
    id: 'rugby',
    name: 'Rugby',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12a7.5 7.5 0 0115 0 7.5 7.5 0 01-15 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5c0 4 0 11 0 15m-4.5-7.5h9" />
      </svg>
    )
  },
  {
    id: 'golf',
    name: 'Golf',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 21h16m-8-2v-4m0-4V3m0 6l5-2-5-2" />
      </svg>
    )
  },
  {
    id: 'afl',
    name: 'AFL',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3v18m12-18v18M6 9h12m-12 5h12" />
      </svg>
    )
  },
  {
    id: 'cricket',
    name: 'Cricket',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19L17 6l3 3-13 13L4 19zm4 2l5-5" />
      </svg>
    )
  },
  {
    id: 'other',
    name: 'Other Sports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a4 4 0 004-4V3H8v8a4 4 0 004 4zm0 0v4m-5 2h10M3 6h3m15 0h-3" />
      </svg>
    )
  }
];

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedSport,
  onSportChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-slate-800/50 rounded-xl border border-white/5 backdrop-blur-sm px-3 py-2 lg:py-1.5 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all duration-200 select-none w-full lg:w-48 xl:w-56">
        <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search matches..."
          className="bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none w-full text-xs font-medium tracking-wide"
        />
      </div>

      <div className="h-8 w-px bg-white/10 hidden lg:block flex-shrink-0"></div>

      {/* Category Icons Bar: Horizontally scrolls smoothly on small screens */}
      <div className="flex flex-row items-center gap-1.5 bg-slate-800/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm w-full lg:w-auto overflow-x-auto scrollbar-none justify-start lg:justify-center">
        {sportIcons.map((sport) => (
          <div key={sport.id} className="relative group flex-shrink-0">
            <button
              onClick={() => onSportChange(sport.id)}
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                selectedSport === sport.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              {sport.icon}
            </button>

            {/* Hover tooltip precisely positioned below the icons */}
            <div className="absolute top-full mt-2 hidden group-hover:block bg-slate-900 border border-slate-700 text-slate-100 text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-[100] transform -translate-x-1/2 left-1/2 pointer-events-none transition-all duration-200">
              {sport.name}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-900"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;