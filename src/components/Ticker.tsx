import React from "react";
import type { APIMatch } from "../services/api";

interface TickerProps {
  matches: APIMatch[];
  onSelect?: (match: APIMatch) => void;
}

/** A broadcast-style live strip; the single authored motion on the site. */
const Ticker: React.FC<TickerProps> = ({ matches, onSelect }) => {
  const live = matches.filter((match) => match.status === "live");

  if (live.length === 0) {
    return (
      <div className="flex min-h-11 items-center gap-3 border-y border-border bg-surface px-4 sm:px-6">
        <span className="sig-stamp bg-surface-elevated px-2 py-1 text-xs text-muted">
          Standby
        </span>
        <span className="truncate font-display text-sm font-semibold uppercase tracking-wider text-muted">
          No feeds on air right now. The next kickoff is on the board below.
        </span>
      </div>
    );
  }

  const items = live.map((match) => (
    <button
      key={match.id}
      type="button"
      onClick={() => onSelect?.(match)}
      className="flex shrink-0 items-center gap-3 border-r border-border px-5 py-2.5 text-left"
    >
      <span className="sig-stamp bg-live-badge px-2 py-0.5 text-xs text-white">
        Live
      </span>
      <span className="font-display text-base font-bold uppercase tracking-wide text-ink">
        {match.title}
      </span>
      <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        {match.tag || match.category}
      </span>
    </button>
  ));

  return (
    <div className="flex min-h-11 items-stretch overflow-hidden border-y border-border bg-surface">
      <span className="z-10 flex shrink-0 items-center bg-live-badge px-4 font-display text-xs font-extrabold uppercase tracking-[0.16em] text-white">
        On air
      </span>
      <div className="ticker-mask relative flex-1 overflow-hidden">
        <div className="ticker-track flex w-max">
          <div className="flex">{items}</div>
          <div className="flex" aria-hidden="true">
            {live.map((match) => (
              <div
                key={`echo-${match.id}`}
                className="flex shrink-0 items-center gap-3 border-r border-border px-5 py-2.5"
              >
                <span className="sig-stamp bg-live-badge px-2 py-0.5 text-xs text-white">
                  Live
                </span>
                <span className="font-display text-base font-bold uppercase tracking-wide text-ink">
                  {match.title}
                </span>
                <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {match.tag || match.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticker;
