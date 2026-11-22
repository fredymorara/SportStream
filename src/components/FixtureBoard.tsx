import React, { useMemo, useState } from "react";
import type { APIMatch } from "../services/api";
import EventArt from "./EventArt";

interface FixtureBoardProps {
  title: string;
  matches: APIMatch[];
  onSelect: (match: APIMatch) => void;
  emptyMessage?: string;
}

type Bucket = "live" | "soon" | "later" | "ended";

const BUCKETS: { id: Bucket; label: string }[] = [
  { id: "live", label: "On air" },
  { id: "soon", label: "Starting soon" },
  { id: "later", label: "Later" },
  { id: "ended", label: "Ended" },
];

const bucketOf = (match: APIMatch): Bucket => {
  if (match.status === "live") return "live";
  if (match.status === "ended") return "ended";
  return match.date - Date.now() <= 2 * 60 * 60 * 1000 ? "soon" : "later";
};

const timeOf = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const stamp = (status: APIMatch["status"]) =>
  status === "live" ? "LIVE" : status === "upcoming" ? "WAITING" : "ENDED";

const stampClass = (status: APIMatch["status"]) =>
  status === "live"
    ? "bg-live-badge text-white"
    : status === "upcoming"
      ? "bg-accent text-ink-inverse"
      : "bg-surface-elevated text-muted";

const FixtureBoard: React.FC<FixtureBoardProps> = ({
  title,
  matches,
  onSelect,
  emptyMessage = "No fixtures in this view. Try another sport or search.",
}) => {
  const [sort, setSort] = useState<"time" | "status">("time");

  const groups = useMemo(() => {
    const byBucket = new Map<Bucket, APIMatch[]>();
    for (const match of matches) {
      const bucket = bucketOf(match);
      const list = byBucket.get(bucket) ?? [];
      list.push(match);
      byBucket.set(bucket, list);
    }
    const rank: Record<APIMatch["status"], number> = {
      live: 0,
      upcoming: 1,
      ended: 2,
    };
    for (const list of byBucket.values()) {
      list.sort((a, b) =>
        sort === "status"
          ? rank[a.status] - rank[b.status] || a.date - b.date
          : a.date - b.date,
      );
    }
    return byBucket;
  }, [matches, sort]);

  return (
    <section className="fixture-board mb-10" aria-label={title}>
      <div className="mb-0 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <h2 className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {matches.length} fixtures
          </span>
          <div className="flex border border-border" role="group" aria-label="Sort fixtures">
            {(["time", "status"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSort(mode)}
                aria-pressed={sort === mode}
                className={`sig-stamp min-h-11 px-3 py-1.5 text-xs transition-colors sm:min-h-0 ${
                  sort === mode
                    ? "bg-ink text-ink-inverse"
                    : "text-muted hover:text-ink"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <p className="border-b border-border px-1 py-10 text-center text-sm text-muted">
          {emptyMessage}
        </p>
      ) : (
        BUCKETS.map((bucket) => {
          const items = groups.get(bucket.id) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={bucket.id}>
              <h3 className="border-b border-border py-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {bucket.label}
                <span className="ml-3 text-accent">{items.length}</span>
              </h3>
              {items.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => onSelect(match)}
                  aria-label={`Watch ${match.title}`}
                  className="group grid w-full grid-cols-[44px_52px_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-1 py-2.5 text-left transition-colors hover:bg-surface sm:grid-cols-[72px_76px_minmax(0,1fr)_160px_96px_104px] sm:gap-4"
                >
                  <span
                    className={`font-display text-xl font-extrabold tabular-nums leading-none sm:text-2xl ${
                      match.status === "live" ? "text-signal" : "text-ink"
                    }`}
                  >
                    {match.status === "live" ? "LIVE" : timeOf(match.date)}
                  </span>

                  <EventArt
                    match={match}
                    className="h-10 w-[52px] sm:h-12 sm:w-[76px]"
                  />

                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg font-bold uppercase leading-tight text-ink group-hover:text-accent sm:text-xl">
                      {match.title}
                    </span>
                    <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {new Intl.DateTimeFormat(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }).format(new Date(match.date))}
                    </span>
                  </span>

                  <span className="hidden truncate font-display text-sm font-semibold uppercase tracking-wider text-muted sm:block">
                    {match.tag || match.category}
                  </span>
                  <span className="hidden font-display text-sm font-semibold uppercase tracking-wider text-muted sm:block">
                    {match.streamLinks.length} {match.streamLinks.length === 1 ? "feed" : "feeds"}
                  </span>
                  <span
                    className={`sig-stamp inline-flex justify-self-end px-1.5 py-1 text-[11px] sm:px-2 sm:text-xs ${stampClass(match.status)}`}
                  >
                    {stamp(match.status)}
                  </span>
                </button>
              ))}
            </div>
          );
        })
      )}
    </section>
  );
};

export default FixtureBoard;
