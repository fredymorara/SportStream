const PRIMARY_API_URL = "https://api.ppv.st";
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

export interface APIMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  endsAt: number;
  poster?: string;
  status: "live" | "upcoming" | "ended";
  uriName: string;
  tag?: string;
  alwaysLive: boolean;
  iframe?: string;
  streamLinks: StreamLink[];
  allowPastStreams: boolean;
}

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
            id: String(stream.id),
            label: stream.tag || "Main feed",
            uriName: stream.uri_name,
            iframe: stream.iframe,
          },
        ]
      : []),
    ...(stream.substreams || [])
      .filter((substream) => Boolean(substream.iframe))
      .map((substream) => ({
        id: String(substream.id),
        label: substream.source_tag || substream.tag || substream.name,
        locale: substream.locale,
        uriName: substream.uri_name,
        iframe: substream.iframe as string,
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
  };
};

export const api = {
  getAllMatches: async (): Promise<APIMatch[]> =>
    (await getStreamCategories()).flatMap((category) =>
      (category.streams || []).map((stream) => toMatch(stream, category)),
    ),

  getPosterUrl: (poster?: string) => poster || "/sports_placeholder.png",
};
