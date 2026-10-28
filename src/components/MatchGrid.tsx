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
    <div className="mb-12">
      {/* Clean Category Header */}
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white">
          {section.name}
        </h3>
        <span className="text-xs font-semibold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-white/10">
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

export default MatchGrid;
