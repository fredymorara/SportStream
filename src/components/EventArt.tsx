import React, { useState } from "react";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";
import { teamInitials } from "../utils/matchup";

const PLACEHOLDER = "/sports_placeholder.png";

interface EventArtProps {
  match: APIMatch;
  className?: string;
  imgClassName?: string;
  alt?: string;
  eager?: boolean;
  children?: React.ReactNode;
}

/** Event artwork supplied by the upstream APIs, with an honest fallback chain. */
const EventArt: React.FC<EventArtProps> = ({
  match,
  className = "",
  imgClassName = "",
  alt,
  eager = false,
  children,
}) => {
  const sources = api.getPosterCandidates(match);
  const [fallback, setFallback] = useState<{ id: string; index: number }>({
    id: match.id,
    index: 0,
  });
  const index = fallback.id === match.id ? fallback.index : 0;
  const src = sources[index] || PLACEHOLDER;

  return (
    <div className={`relative overflow-hidden bg-surface-elevated ${className}`}>
      <img
        src={src}
        alt={alt ?? ""}
        aria-hidden={alt ? undefined : true}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() =>
          setFallback({
            id: match.id,
            index: Math.min(index + 1, sources.length - 1),
          })
        }
        className={`h-full w-full object-cover ${imgClassName}`}
      />
      {children}
    </div>
  );
};

interface TeamCrestProps {
  src?: string;
  team: string;
  className?: string;
}

/** A real crest from the API when it has one, otherwise a typeset monogram. */
export const TeamCrest: React.FC<TeamCrestProps> = ({
  src,
  team,
  className = "",
}) => {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const failed = Boolean(src) && failedSource === src;

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`shrink-0 items-center justify-center border border-current bg-black/20 font-display font-bold leading-none ${className}`}
      >
        {teamInitials(team)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={() => setFailedSource(src)}
      className={`shrink-0 object-contain ${className}`}
    />
  );
};

export default EventArt;
