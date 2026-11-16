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
      <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
        <h3 className="text-xl font-black tracking-tight text-ink sm:text-2xl">
          {section.name}
        </h3>
        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-bold text-muted">
          {section.matches.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {section.matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(MatchGrid);
