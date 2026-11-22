/** Split "Team A vs Team B" into its two sides. Returns null for single-entity events. */
export const parseMatchup = (title: string): [string, string] | null => {
  const match = title.match(/^(.+?)\s+(?:vs?\.?|versus|at)\s+(.+)$/i);
  if (!match) return null;
  const left = match[1].trim();
  const right = match[2].trim();
  return left && right ? [left, right] : null;
};

const initialsOf = (team: string) =>
  team
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export const teamInitials = initialsOf;
