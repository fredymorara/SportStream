import React from "react";
import type { APIMatch } from "../services/api";
import type { SportDefinition } from "../utils/eventGroups";
import FixtureList from "./FixtureList";

interface SportTileProps {
  sport: SportDefinition;
  matches: APIMatch[];
  active: boolean;
  onSelect: (id: string) => void;
  onOpenMatch: (match: APIMatch) => void;
}

const SportTile: React.FC<SportTileProps> = ({
  sport,
  matches,
  active,
  onSelect,
  onOpenMatch,
}) => {
  const liveCount = matches.filter((match) => match.status === "live").length;

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => onSelect(sport.id)}
        aria-label={`${sport.name}, ${matches.length} fixtures`}
        aria-pressed={false}
        className="sport-tile relative col-span-3 flex h-[220px] flex-col justify-between overflow-hidden p-5 text-left transition-transform duration-150 hover:-translate-y-0.5"
        style={{ backgroundColor: sport.field }}
      >
        <span className="font-mono text-[13px] uppercase tracking-[0.12em] text-white">
          {matches.length} fixtures · {liveCount} live
        </span>
        <span className="sport-tile__name text-white/95" aria-hidden="true">
          {sport.name.toLowerCase()}
        </span>
        <span className="h-[3px] w-10 bg-white/80" aria-hidden="true" />
      </button>
    );
  }

  return (
    <section
      className="board-enter relative col-span-12 border-t-4 pt-0"
      style={{ borderColor: "var(--color-accent)" }}
      aria-label={sport.name}
    >
      <div className="flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:gap-10">
        <div className="flex shrink-0 flex-row items-end justify-between gap-4 lg:w-[320px] lg:flex-col lg:items-start">
          <h2 className="sport-tile__name text-accent" aria-hidden="true">
            {sport.name.toLowerCase()}
          </h2>
          <div className="font-mono text-[13px] uppercase tracking-[0.12em] text-muted">
            {matches.length} fixtures · {liveCount} live
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <FixtureList matches={matches} onSelect={onOpenMatch} />
        </div>
      </div>
    </section>
  );
};

export default SportTile;
