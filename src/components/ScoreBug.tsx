import React from "react";
import type { APIMatch } from "../services/api";
import { TeamCrest } from "./EventArt";
import { parseMatchup } from "../utils/matchup";

interface ScoreBugProps {
  match: APIMatch;
  compact?: boolean;
  className?: string;
}

const statusLabel = (status: APIMatch["status"]) =>
  status === "live" ? "Live" : status === "upcoming" ? "Waiting" : "Ended";

const statusClass = (status: APIMatch["status"]) =>
  status === "live"
    ? "bg-live-badge text-white"
    : status === "upcoming"
      ? "bg-accent text-ink-inverse"
      : "bg-surface-elevated text-muted";

const kickoff = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

/** The signature move: two plates collide at a red VS under a broadcast clock.
 *  Single-entity events still get the full form: entity vs its competition. */
const ScoreBug: React.FC<ScoreBugProps> = ({
  match,
  compact = false,
  className = "",
}) => {
  const sides = parseMatchup(match.title);
  const left = sides?.[0] ?? match.title;
  const right = sides?.[1] ?? match.tag ?? match.category ?? "On air";
  // On a phone the two plates still collide at the VS, but the crest and type
  // step down so a long team name wraps at a space instead of mid-word.
  const crestSize = compact
    ? "h-6 w-6 p-0.5 text-[10px] sm:h-7 sm:w-7 sm:p-0.5 sm:text-[11px]"
    : "h-6 w-6 p-0.5 text-[10px] sm:h-12 sm:w-12 sm:p-1";
  const nameClass = compact
    ? "text-base sm:text-2xl"
    : "text-[clamp(1rem,4vw,3.25rem)]";

  return (
    <div className={className}>
      <div className="scorebug__head mb-3 flex flex-wrap items-center gap-3">
        <span className={`sig-lamp px-3 py-1 text-xs ${statusClass(match.status)}`}>
          <span className="sig-lamp__dot" />
          {statusLabel(match.status)}
        </span>
        <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted">
          {match.tag || match.category}
        </span>
      </div>

      <h2 className="sr-only">{match.title}</h2>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch">
        <div className="scorebug__plate scorebug__plate--left flex min-w-0 items-center justify-end gap-1.5 bg-ink py-2 pl-1.5 pr-1.5 text-right text-ink-inverse sm:gap-3 sm:py-4 sm:pl-4 sm:pr-3">
          <TeamCrest
            src={match.crests?.[0]}
            team={left}
            className={`${crestSize} flex`}
          />
          <span
            aria-hidden="true"
            className={`min-w-0 break-words font-display font-extrabold uppercase leading-[0.86] tracking-tight ${nameClass}`}
          >
            {left}
          </span>
        </div>

        <div
          aria-hidden="true"
          className="scorebug__vs flex items-center bg-signal px-1.5 font-display text-lg font-extrabold text-white sm:px-4 sm:text-3xl"
        >
          VS
        </div>

        <div className="scorebug__plate scorebug__plate--right flex min-w-0 items-center justify-start gap-1.5 border-l border-border-bright bg-surface py-2 pl-1.5 pr-1.5 text-left text-ink sm:gap-3 sm:py-4 sm:pr-4">
          <span
            aria-hidden="true"
            className={`min-w-0 break-words font-display font-extrabold uppercase leading-[0.86] tracking-tight ${nameClass}`}
          >
            {right}
          </span>
          <TeamCrest
            src={match.crests?.[1] ?? match.crests?.[0]}
            team={right}
            className={`${crestSize} flex`}
          />
        </div>
      </div>

      <div className="scorebug__meta mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-border-bright pt-3">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {match.status === "live" ? "On air" : "Kickoff"}
          </p>
          <p className="font-display text-3xl font-extrabold leading-none text-accent sm:text-4xl">
            {kickoff(match.date)}
          </p>
        </div>
        <p className="text-xs font-medium text-muted">
          {new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            day: "numeric",
            month: "short",
          }).format(new Date(match.date))}
        </p>
      </div>
    </div>
  );
};

export default ScoreBug;
