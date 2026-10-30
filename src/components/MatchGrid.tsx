import React from "react";
import MatchCard from "./MatchCard";
import type { APIMatch } from "../services/api";

interface MatchGridProps {
  section: {
    id: string;
    name: string;
    matches: APIMatch[];
  };
}

const MatchGrid: React.FC<MatchGridProps> = ({ section }) => {
  return (
    <div className="match-grid-section mb-12">
      {/* Clean Category Header */}
      <div className="mb-7 flex items-end gap-4 border-b border-white/10 pb-4">
        <h3 className="text-balance text-2xl font-black leading-none tracking-[-0.03em] text-white sm:text-3xl lg:text-4xl">
          {section.name}
        </h3>
        <span className="mb-1 rounded-full border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-400">
          {section.matches.length}
        </span>
      </div>

      {/* Clean Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-8">
        {section.matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(MatchGrid);
