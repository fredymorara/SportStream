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

interface StreamFreeEvent {
  name: string;
  category: string;
  league?: string;
  stream_key: string;
  match_timestamp: number;
  sources: string[];
  live_sources: string[];
  thumbnail_url?: string;
}

interface StreamFreeResponse {
  count?: number;
  streams: StreamFreeEvent[];
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

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
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

const fetchFromAvailableDomain = async <T>(path: string): Promise<T> => {
  const domains = await getApiDomains();
  let lastError: unknown;

  for (const domain of domains) {
    try {
      const response = await fetchJson<T>(`${domain}${path}`);
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

const getStreamCategories = async () => {
  if (cachedCategories && Date.now() < cacheExpiresAt) return cachedCategories;
  if (categoriesPromise) return categoriesPromise;

  categoriesPromise = fetchFromAvailableDomain<StreamsResponse>("/api/streams")
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

const toStreamFreeMatch = (stream: StreamFreeEvent): APIMatch => {
  const date = Number(stream.match_timestamp) * 1000 || Date.now();
  const liveSources = new Set(stream.live_sources || []);
  const sources = [...new Set([...(stream.sources || []), ...liveSources])];
  const streamLinks = sources.map((source, index) => {
    const sourcePath = new URL(source).pathname.split("/").at(-1) || "";
    const variant = sourcePath.startsWith(stream.stream_key)
      ? sourcePath.slice(stream.stream_key.length).toLowerCase()
      : sourcePath.toLowerCase();
    const quality = variant.match(/\d{3,4}p/)?.[0]?.toUpperCase() || "Stream";
    const sourceLabel = variant.endsWith("1080p2")
      ? "Source 2"
      : variant.endsWith("1080p")
        ? "Source 1"
        : `Variant ${index + 1}`;

    return {
      id: `streamfree-${stream.stream_key}-${index}`,
      label: `Admin 2 · ${sourceLabel} · ${quality}`,
      uriName: `streamfree-${stream.stream_key}`,
      iframe: source,
      isLive: liveSources.has(source),
      provider: "streamfree" as const,
    };
  });
  const category =
    stream.category.toLowerCase() === "soccer" ? "football" : stream.category;

  return {
    id: `streamfree:${stream.stream_key}`,
    title: stream.name,
    category,
    date,
    endsAt: date,
    poster: stream.thumbnail_url,
    status:
      liveSources.size > 0 ? "live" : date > Date.now() ? "upcoming" : "ended",
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

const getStreamFreeMatches = async (): Promise<APIMatch[]> => {
  if (cachedStreamFreeMatches && Date.now() < streamFreeCacheExpiresAt) {
    return cachedStreamFreeMatches;
  }
  if (streamFreeMatchesPromise) return streamFreeMatchesPromise;

  streamFreeMatchesPromise = fetchJson<StreamFreeResponse>(
    `${STREAMFREE_API_URL}/streams`,
  )
    .then((response) => {
      if (!Array.isArray(response.streams)) {
        throw new Error("StreamFree returned an invalid streams response.");
      }
      cachedStreamFreeMatches = response.streams.map(toStreamFreeMatch);
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
            label: stream.tag ? `Admin · ${stream.tag}` : "Admin",
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
        label: `Admin · ${substream.source_tag || substream.tag || substream.name}`,
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
  ].filter((poster): poster is string => Boolean(poster));

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
  getAllMatches: async (): Promise<APIMatch[]> => {
    const [ppvResult, streamFreeResult] = await Promise.allSettled([
      getStreamCategories().then((categories) =>
        categories.flatMap((category) =>
          (category.streams || [])
            .filter(
              (stream) =>
                !HIDDEN_STREAM_URI_NAMES.has(stream.uri_name.toLowerCase()),
            )
            .map((stream) => toMatch(stream, category)),
        ),
      ),
      getStreamFreeMatches(),
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

  getPosterUrl: (poster?: string) => poster || "/sports_placeholder.png",
  getPosterCandidates,
};
