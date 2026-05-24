import React, { useRef } from 'react';
import MatchCard from './MatchCard';
import type { APIMatch } from '../services/api';

interface SwimlaneProps {
  section: {
    id: string;
    name: string;
    matches: APIMatch[];
  };
}

const Swimlane: React.FC<SwimlaneProps> = ({ section }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Scroll by approximately two cards on desktop, one card on mobile
      const scrollAmount = window.innerWidth > 1024 ? 760 : 340;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="mb-16 md:mb-24 animate-fade-in relative group">
      {/* Category Header */}
      <div className="flex items-center gap-4 mb-4 pl-2 border-l-4 border-emerald-500/50">
        {section.id === 'popular_live' && (
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
        )}
        <h3 className="text-white text-2xl md:text-3xl font-black tracking-tighter">
          {section.name}
        </h3>
        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md backdrop-blur-sm">
          {section.matches.length}
        </span>
      </div>

      <div className="relative">
        {/* Left Navigation Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md hidden sm:flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-emerald-500 hover:text-black hover-spring shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:scale-110"
          aria-label="Scroll left"
        >
          <svg className="w-7 h-7 pr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scrollable Container: Left aligned, bleeds off the right edge */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 pb-6 pt-4 -mr-4 sm:-mr-6 lg:-mr-8 xl:-mr-12 pr-4 sm:pr-6 lg:pr-8 xl:pr-12 snap-x snap-mandatory"
        >
          {section.matches.map((match) => (
            <div key={match.id} className="w-[75vw] sm:w-[280px] lg:w-[300px] xl:w-[320px] flex-shrink-0 snap-start">
              <MatchCard match={match} />
            </div>
          ))}
        </div>

        {/* Right Navigation Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md hidden sm:flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-emerald-500 hover:text-black hover-spring shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:scale-110"
          aria-label="Scroll right"
        >
          <svg className="w-7 h-7 pl-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Swimlane;
