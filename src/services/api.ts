const PRIMARY_API_URL = "https://api.ppv.st";
const STREAMFREE_API_URL = "https://streamfree.top/api/v1";
const CACHE_DURATION_MS = 60_000;

interface ApiResponse {
  success: boolean;
}

interface PingResponse extends ApiResponse {
  domains?: string[];
}

interface ProviderStream {
  id: number;
  name: string;
  tag?: string;
  poster?: string;
  uri_name: string;
  starts_at: number;
  ends_at: number;
  always_live: number;
  category_name?: string;
  iframe?: string;
  substreams?: ProviderSubstream[];
  allowpaststreams?: number;
}

interface ProviderSubstream {
  id: number;
  name: string;
  tag?: string;
  source_tag?: string;
  locale?: string;
  uri_name: string;
  iframe?: string;
}

export interface StreamLink {
  id: string;
  label: string;
  locale?: string;
  uriName: string;
  iframe: string;
  isLive?: boolean;
  provider: "ppv" | "streamfree";
}

export interface StreamCategory {
  category: string;
  id: number;
  always_live: number;
  streams: ProviderStream[];
}

interface StreamsResponse extends ApiResponse {
  streams: StreamCategory[];
}

interface StreamFreeSource {
  quality: string;
  url: string;
  live?: boolean;
}

interface StreamFreeEvent {
  name: string;
  category: string;
  league?: string;
  stream_key: string;
  match_timestamp: number;
  iframe?: string;
  additional_sources?: StreamFreeSource[];
  thumbnail_url?: string;
  viewers?: number;
}

interface StreamFreeResponse {
  count?: number;
  streams: StreamFreeEvent[];
}

interface StreamFreeSourcesResponse {
  stream_key: string;
  sources: StreamFreeSource[];
}

export interface APIMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  endsAt: number;
  poster?: string;
  posterFallbacks?: string[];
  status: "live" | "upcoming" | "ended";
  uriName: string;
  tag?: string;
  alwaysLive: boolean;
  iframe?: string;
  streamLinks: StreamLink[];
  allowPastStreams: boolean;
  provider: "ppv" | "streamfree" | "combined";
}

const MATCH_TIME_TOLERANCE_MS = 30 * 60 * 1000;

const getMatchupKey = (title: string) => {
  const teams = title.split(/\s+(?:vs?\.?|versus|at)\s+|\s+@\s+/i);
  if (teams.length !== 2) return null;

  const normalizedTeams = teams.map((team) =>
    team
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\b(?:fc|cf|sc|afc)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " "),
  );
  if (normalizedTeams.some((team) => !team)) return null;
  return normalizedTeams.sort().join("::");
};

const normalizeDomain = (domain: string) => {
  const withProtocol = /^https?:\/\//i.test(domain)
    ? domain
    : `https://${domain}`;
  return withProtocol.replace(/\/+$/, "");
};

const fetchJson = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

let domainsPromise: Promise<string[]> | null = null;
const getApiDomains = () => {
  if (!domainsPromise) {
    domainsPromise = fetchJson<PingResponse>(`${PRIMARY_API_URL}/api/ping`)
      .then((response) => {
        if (!response.success) return [PRIMARY_API_URL];
        const mirrors = (response.domains || []).map(normalizeDomain);
        return [...new Set([PRIMARY_API_URL, ...mirrors])];
      })
      .catch(() => [PRIMARY_API_URL]);
  }
  return domainsPromise;
};

const fetchFromAvailableDomain = async <T>(
  path: string,
  forceRefresh = false,
): Promise<T> => {
  const domains = await getApiDomains();
  let lastError: unknown;

  for (const domain of domains) {
    try {
      const response = await fetchJson<T>(
        forceRefresh
          ? `${domain}${path}${path.includes("?") ? "&" : "?"}_refresh=${Date.now()}`
          : `${domain}${path}`,
      );
      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        (response as ApiResponse).success === false
      ) {
        throw new Error(
          `The API at ${domain} reported an unsuccessful response.`,
        );
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to reach the streams API.");
};

let cachedCategories: StreamCategory[] | null = null;
let cacheExpiresAt = 0;
let categoriesPromise: Promise<StreamCategory[]> | null = null;

const getStreamCategories = async (forceRefresh = false) => {
  if (
    !forceRefresh &&
    cachedCategories &&
    Date.now() < cacheExpiresAt
  ) {
    return cachedCategories;
  }
  if (categoriesPromise) return categoriesPromise;

  categoriesPromise = fetchFromAvailableDomain<StreamsResponse>(
    "/api/streams",
    forceRefresh,
  )
    .then((response) => {
      if (!response.success || !Array.isArray(response.streams)) {
        throw new Error("The streams API returned an invalid response.");
      }
      cachedCategories = response.streams;
      cacheExpiresAt = Date.now() + CACHE_DURATION_MS;
      return cachedCategories;
    })
    .finally(() => {
      categoriesPromise = null;
    });

  return categoriesPromise;
};

let cachedStreamFreeMatches: APIMatch[] | null = null;
let streamFreeCacheExpiresAt = 0;
let streamFreeMatchesPromise: Promise<APIMatch[]> | null = null;

const STREAMFREE_SOURCE_CONCURRENCY = 8;

const qualityFromUrl = (url: string) => {
  const variant = url
    .match(/(2160p|1080p|720p|480p|4k)\d*$/i)?.[1]
    .toLowerCase();
  if (!variant) return "Stream";
  if (variant === "4k" || variant === "2160p") return "4K";
  if (variant === "1080p") return "FHD";
  if (variant === "720p") return "HD";
  return "SD";
};

const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from(
      { length: Math.min(limit, items.length) },
      async () => {
        while (nextIndex < items.length) {
          const index = nextIndex++;
          results[index] = await mapper(items[index]);
        }
      },
    ),
  );

  return results;
};

const fetchStreamFreeSources = async (
  stream: StreamFreeEvent,
): Promise<StreamFreeSource[]> => {
  try {
    const response = await fetchJson<StreamFreeSourcesResponse>(
      `${STREAMFREE_API_URL}/sources/${encodeURIComponent(stream.stream_key)}`,
    );
    return Array.isArray(response.sources) ? response.sources : [];
  } catch {
    // The stream list still carries the main embed URL, so degrade gracefully.
    return [];
  }
};

const toStreamFreeMatch = (
  stream: StreamFreeEvent,
  liveSources: StreamFreeSource[] = [],
): APIMatch => {
  const date = Number(stream.match_timestamp) * 1000 || Date.now();
  const additionalSources = stream.additional_sources || [];
  const anyLive = liveSources.some((source) => source.live);

  const candidates: StreamFreeSource[] = [
    ...liveSources,
    ...(stream.iframe
      ? [
          {
            quality:
              liveSources.find((source) => source.url === stream.iframe)
                ?.quality || qualityFromUrl(stream.iframe),
            url: stream.iframe,
            live:
              liveSources.find((source) => source.url === stream.iframe)?.live ??
              (anyLive || additionalSources.some((source) => source.live)),
          },
        ]
      : []),
    ...additionalSources,
  ];

  const sources: StreamFreeSource[] = [];
  const seenUrls = new Set<string>();
  for (const source of candidates) {
    if (!source?.url || seenUrls.has(source.url)) continue;
    seenUrls.add(source.url);
    sources.push(source);
  }

  const streamLinks = sources.map((source, index) => {
    const qualityLabel = source.quality || "Stream";
    const sourceLabel = index === 0 ? "Source 1" : `Source ${index + 1}`;
    return {
      id: `streamfree-${stream.stream_key}-${index}`,
      label: `${sourceLabel} · ${qualityLabel}`,
      uriName: `streamfree-${stream.stream_key}`,
      iframe: source.url,
      isLive: Boolean(source.live),
      provider: "streamfree" as const,
    };
  });

  const hasLiveLink = streamLinks.some((link) => link.isLive);
  const category =
    stream.category.toLowerCase() === "soccer" ? "football" : stream.category;

  return {
    id: `streamfree:${stream.stream_key}`,
    title: stream.name,
    category,
    date,
    endsAt: date,
    poster: stream.thumbnail_url,
    status: hasLiveLink ? "live" : date > Date.now() ? "upcoming" : "ended",
    uriName: `streamfree-${stream.stream_key}`,
    tag: stream.league || "",
    alwaysLive: false,
    iframe:
      streamLinks.find((link) => link.isLive)?.iframe || streamLinks[0]?.iframe,
    streamLinks,
    allowPastStreams: false,
    provider: "streamfree",
  };
};

const getStreamFreeMatches = async (
  forceRefresh = false,
): Promise<APIMatch[]> => {
  if (
    !forceRefresh &&
    cachedStreamFreeMatches &&
    Date.now() < streamFreeCacheExpiresAt
  ) {
    return cachedStreamFreeMatches;
  }
  if (streamFreeMatchesPromise) return streamFreeMatchesPromise;

  streamFreeMatchesPromise = fetchJson<StreamFreeResponse>(
    `${STREAMFREE_API_URL}/streams${forceRefresh ? `?_refresh=${Date.now()}` : ""}`,
  )
    .then(async (response) => {
      if (!Array.isArray(response.streams)) {
        throw new Error("StreamFree returned an invalid streams response.");
      }
      const liveSourcesByKey = await mapWithConcurrency(
        response.streams,
        STREAMFREE_SOURCE_CONCURRENCY,
        fetchStreamFreeSources,
      );
      cachedStreamFreeMatches = response.streams.map((stream, index) =>
        toStreamFreeMatch(stream, liveSourcesByKey[index]),
      );
      streamFreeCacheExpiresAt = Date.now() + CACHE_DURATION_MS;
      return cachedStreamFreeMatches;
    })
    .finally(() => {
      streamFreeMatchesPromise = null;
    });

  return streamFreeMatchesPromise;
};

const toMatch = (
  stream: ProviderStream,
  category: StreamCategory,
): APIMatch => {
  const startsAt = stream.starts_at * 1000;
  const endsAt = stream.ends_at * 1000;
  const alwaysLive = stream.always_live === 1 || category.always_live === 1;
  const now = Date.now();
  const status =
    alwaysLive || (startsAt <= now && endsAt >= now)
      ? "live"
      : startsAt > now
        ? "upcoming"
        : "ended";
  const streamLinks: StreamLink[] = [
    ...(stream.iframe
      ? [
          {
            id: `ppv-${stream.id}`,
            label: stream.tag || "Primary feed",
            uriName: stream.uri_name,
            iframe: stream.iframe,
            isLive: status === "live",
            provider: "ppv" as const,
          },
        ]
      : []),
    ...(stream.substreams || [])
      .filter((substream) => Boolean(substream.iframe))
      .map((substream) => ({
        id: `ppv-${substream.id}`,
        label: substream.source_tag || substream.tag || substream.name,
        locale: substream.locale,
        uriName: substream.uri_name,
        iframe: substream.iframe as string,
        isLive: status === "live",
        provider: "ppv" as const,
      })),
  ];

  return {
    id: String(stream.id),
    title: stream.name,
    category: stream.category_name || category.category,
    date: startsAt,
    endsAt,
    poster: stream.poster,
    status,
    uriName: stream.uri_name,
    tag: stream.tag,
    alwaysLive,
    iframe: stream.iframe,
    streamLinks,
    allowPastStreams: stream.allowpaststreams === 1,
    provider: "ppv",
  };
};

const HIDDEN_STREAM_URI_NAMES = new Set(["247-cows"]);

const getPosterCandidates = (
  match: Pick<APIMatch, "poster" | "posterFallbacks">,
) =>
  [
    ...new Set([
      match.poster,
      ...(match.posterFallbacks || []),
      "/sports_placeholder.png",
    ]),
  ].filter((poster): poster is string => {
    if (!poster) return false;
    if (poster.startsWith("/")) return true;
    try {
      const url = new URL(poster);
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        Boolean(url.hostname)
      );
    } catch {
      return false;
    }
  });

const mergeProviderMatches = (
  ppvMatches: APIMatch[],
  streamFreeMatches: APIMatch[],
) => {
  const unmatchedStreamFree = new Set(streamFreeMatches);
  const mergedPpvMatches = ppvMatches.map((ppvMatch) => {
    const matchupKey = getMatchupKey(ppvMatch.title);
    if (!matchupKey) return ppvMatch;

    const duplicate = [...unmatchedStreamFree]
      .filter(
        (streamFreeMatch) =>
          getMatchupKey(streamFreeMatch.title) === matchupKey,
      )
      .map((streamFreeMatch) => ({
        match: streamFreeMatch,
        timeDifference: Math.abs(streamFreeMatch.date - ppvMatch.date),
      }))
      .filter(({ timeDifference }) => timeDifference <= MATCH_TIME_TOLERANCE_MS)
      .sort((a, b) => a.timeDifference - b.timeDifference)[0]?.match;

    if (!duplicate) return ppvMatch;
    unmatchedStreamFree.delete(duplicate);
    const status: APIMatch["status"] =
      ppvMatch.status === "live" || duplicate.status === "live"
        ? "live"
        : ppvMatch.status;
    const poster = ppvMatch.poster || duplicate.poster;
    const posterFallbacks = [
      ...(ppvMatch.poster ? [duplicate.poster] : []),
      ...(ppvMatch.posterFallbacks || []),
      ...(duplicate.posterFallbacks || []),
    ].filter(
      (candidate): candidate is string =>
        Boolean(candidate) && candidate !== poster,
    );
    return {
      ...ppvMatch,
      poster,
      posterFallbacks: [...new Set(posterFallbacks)],
      status,
      streamLinks: [...ppvMatch.streamLinks, ...duplicate.streamLinks],
      provider: "combined" as const,
    };
  });

  return [...mergedPpvMatches, ...unmatchedStreamFree];
};

export const api = {
  getAllMatches: async (forceRefresh = false): Promise<APIMatch[]> => {
    const [ppvResult, streamFreeResult] = await Promise.allSettled([
      getStreamCategories(forceRefresh).then((categories) =>
        categories.flatMap((category) =>
          (category.streams || [])
            .filter(
              (stream) =>
                !HIDDEN_STREAM_URI_NAMES.has(stream.uri_name.toLowerCase()),
            )
            .map((stream) => toMatch(stream, category)),
        ),
      ),
      getStreamFreeMatches(forceRefresh),
    ]);

    const ppvMatches = ppvResult.status === "fulfilled" ? ppvResult.value : [];
    const streamFreeMatches =
      streamFreeResult.status === "fulfilled" ? streamFreeResult.value : [];
    const matches = mergeProviderMatches(ppvMatches, streamFreeMatches);
    if (matches.length === 0) {
      const failure =
        ppvResult.status === "rejected"
          ? ppvResult.reason
          : streamFreeResult.status === "rejected"
            ? streamFreeResult.reason
            : null;
      if (failure) throw failure;
    }
    return matches;
  },

  getPosterCandidates,
};
