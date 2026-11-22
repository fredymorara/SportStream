import type { APIMatch } from "../services/api";

export type SportId = "football" | "basketball" | "baseball" | "other";

export interface SportDefinition {
  id: SportId;
  name: string;
  field: string;
}

export const SPORTS: SportDefinition[] = [
  { id: "football", name: "Football", field: "#0d7480" },
  { id: "basketball", name: "Basketball", field: "#b45309" },
  { id: "baseball", name: "Baseball", field: "#1d4ed8" },
  { id: "other", name: "Other sports", field: "#4b5563" },
];

export const sportOf = (match: APIMatch): SportId => {
  const category = (match.category || "").toLowerCase();
  if (/football|soccer/.test(category)) return "football";
  if (/basketball/.test(category)) return "basketball";
  if (/baseball/.test(category)) return "baseball";
  return "other";
};

/** Only current and future events are shown. */
export const isUpcomingOrLive = (match: APIMatch) => match.status !== "ended";

export type TimeBucket = "live" | "soon" | "today" | "tomorrow" | "later";

export const BUCKETS: { id: TimeBucket; label: string }[] = [
  { id: "live", label: "Live now" },
  { id: "soon", label: "Starting soon" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "later", label: "Later" },
];

const startOfDay = (dayOffset: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date.getTime();
};

export const bucketOf = (match: APIMatch): TimeBucket => {
  if (match.status === "live") return "live";
  if (match.date <= Date.now() + 60 * 60 * 1000) return "soon";
  if (match.date < startOfDay(1)) return "today";
  if (match.date < startOfDay(2)) return "tomorrow";
  return "later";
};

/** Nearest start first; live events lead their sport. */
export const byProximity = (a: APIMatch, b: APIMatch) => {
  if (a.status === "live" && b.status !== "live") return -1;
  if (b.status === "live" && a.status !== "live") return 1;
  return a.date - b.date;
};

export const streamState = (match: APIMatch) => {
  if (match.streamLinks.length > 0) {
    return match.status === "live"
      ? { label: "Stream live", tone: "live" as const }
      : { label: "Stream ready", tone: "live" as const };
  }
  return match.status === "live"
    ? { label: "No feeds", tone: "idle" as const }
    : { label: "Stream not live yet", tone: "idle" as const };
};
