import React from "react";
import type { APIMatch } from "../services/api";
import { BUCKETS, bucketOf, streamState, type TimeBucket } from "../utils/eventGroups";

interface FixtureListProps {
  matches: APIMatch[];
  onSelect: (match: APIMatch) => void;
  emptyMessage?: string;
}

const timeOf = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(
    new Date(timestamp),
  );

const FixtureList: React.FC<FixtureListProps> = ({
  matches,
  onSelect,
  emptyMessage = "No fixtures in this sport right now.",
}) => {
  if (matches.length === 0) {
    return (
      <div className="border-t border-border px-4 py-10 text-center">
        <p className="text-base text-muted">{emptyMessage}</p>
      </div>
    );
  }

  const grouped = new Map<TimeBucket, APIMatch[]>();
  for (const match of matches) {
    const bucket = bucketOf(match);
    const list = grouped.get(bucket) ?? [];
    list.push(match);
    grouped.set(bucket, list);
  }

  return (
    <div className="board-enter">
      {BUCKETS.map((bucket) => {
        const items = grouped.get(bucket.id) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={bucket.id} aria-label={bucket.label}>
            <h3 className="border-t border-border px-4 pb-2 pt-5 font-mono text-[13px] font-normal uppercase tracking-[0.12em] text-muted">
              {bucket.label}
              <span className="ml-3 text-idle">{items.length}</span>
            </h3>
            {items.map((match) => {
              const state = streamState(match);
              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => onSelect(match)}
                  className="fixture-row focus-visible:relative focus-visible:z-10"
                  aria-label={`Watch ${match.title}`}
                >
                  <span className="fixture-row__time">{timeOf(match.date)}</span>
                  <span className="min-w-0">
                    <span className="fixture-row__title block truncate">{match.title}</span>
                    <span className="fixture-row__meta block truncate">
                      {match.tag || match.category || "Event"}
                    </span>
                  </span>
                  <span className={`state-line state-line--${state.tone}`}>
                    <span className="state-line__mark" aria-hidden="true" />
                    {state.label}
                  </span>
                </button>
              );
            })}
          </section>
        );
      })}
    </div>
  );
};

export default FixtureList;
