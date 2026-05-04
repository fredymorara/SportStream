const BASE_URL = "https://streamed.pk/api";

// Strict Type Definitions matching the API schema
export interface APIMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  status?: string;
  teams?: {
    home?: {
      name: string;
      badge: string;
    };
    away?: {
      name: string;
      badge: string;
    };
  };
  sources: {
    source: string;
    id: string;
    hd?: boolean;
  }[];
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

export interface Sport {
  id: string;
  name: string;
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const api = {
  // Sports API
  getSports: () => fetchJson<Sport[]>(`${BASE_URL}/sports`),

  // Matches API
  getAllMatches: () => fetchJson<APIMatch[]>(`${BASE_URL}/matches/all`),
  getLiveMatches: () => fetchJson<APIMatch[]>(`${BASE_URL}/matches/live`),
  getTodayMatches: () => fetchJson<APIMatch[]>(`${BASE_URL}/matches/all-today`),
  getSportMatches: (sport: string) =>
    fetchJson<APIMatch[]>(`${BASE_URL}/matches/${sport}`),
  getPopularMatches: (endpoint: string) =>
    fetchJson<APIMatch[]>(`${BASE_URL}/matches/${endpoint}/popular`),

  // Streams API
  getStreams: (source: string, id: string) =>
    fetchJson<Stream[]>(`${BASE_URL}/stream/${source}/${id}`),

  // Images API
  getBadgeUrl: (badge: string) => `${BASE_URL}/images/badge/${badge}.webp`,
  getPosterUrl: (posterId: string) => {
    if (posterId && posterId.startsWith("/")) {
      return `https://streamed.pk${posterId}.webp`;
    }
    return `${BASE_URL}/images/proxy/${posterId}.webp`;
  },
};
