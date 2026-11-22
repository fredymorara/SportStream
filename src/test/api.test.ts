import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { APIMatch } from "../services/api";

const nowSeconds = Math.floor(Date.now() / 1000);

const streamFreeStreams = [
  {
    id: "villarreal-vs-barcelona",
    name: "Villarreal vs Barcelona",
    category: "soccer",
    league: "La Liga",
    stream_key: "villarreal-vs-barcelona",
    match_timestamp: nowSeconds - 600,
    thumbnail_url: "https://streamfree.top/thumbnails/villarreal",
    iframe: "https://strmfree.st/embed/soccer/villarreal-vs-barcelona1080p",
    additional_sources: [
      {
        quality: "FHD",
        url: "https://strmfree.st/embed/soccer/villarreal-vs-barcelona1080p2",
        live: true,
      },
    ],
    viewers: 120,
  },
  {
    id: "skyf1",
    name: "Sky Sports F1",
    category: "racing",
    league: "F1",
    stream_key: "skyf1",
    match_timestamp: 1_782_403_200,
    thumbnail_url: "https://streamfree.top/thumbnails/skyf1",
    iframe: "https://strmfree.st/embed/racing/skyf11080p",
    additional_sources: [],
    viewers: 42,
  },
  {
    id: "future-game",
    name: "Future Game",
    category: "soccer",
    stream_key: "future-game",
    match_timestamp: nowSeconds + 7200,
    iframe: "https://strmfree.st/embed/soccer/future-game1080p",
    additional_sources: [],
    viewers: 0,
  },
];

const streamFreeSources: Record<string, { quality: string; url: string; live: boolean }[]> = {
  "villarreal-vs-barcelona": [
    {
      quality: "FHD",
      url: "https://strmfree.st/embed/soccer/villarreal-vs-barcelona1080p",
      live: true,
    },
    {
      quality: "FHD",
      url: "https://strmfree.st/embed/soccer/villarreal-vs-barcelona1080p2",
      live: true,
    },
  ],
  skyf1: [
    { quality: "FHD", url: "https://strmfree.st/embed/racing/skyf11080p", live: true },
  ],
  "future-game": [],
};

const ppvStreams = [
  {
    category: "Football",
    id: 34,
    always_live: 0,
    streams: [
      {
        id: 101,
        name: "Barcelona vs. Villarreal",
        tag: "LaLiga",
        source_tag: "HD | ESPN+",
        uri_name: "laliga/2026-11-22/bar-vil",
        starts_at: nowSeconds - 600,
        ends_at: nowSeconds + 4800,
        always_live: 0,
        locale: "en",
        category_name: "Football",
        iframe: "https://ppv.example/embed/laliga/bar-vil",
        substreams: [
          {
            id: 201,
            name: "Barcelona vs. Villarreal",
            tag: "LaLiga",
            source_tag: "SD | ESPN+",
            locale: "en",
            uri_name: "laliga/2026-11-22/bar-vil_540p",
            iframe: "https://ppv.example/embed/laliga/bar-vil_540p",
          },
        ],
      },
    ],
  },
  {
    category: "Cricket",
    id: 47,
    always_live: true,
    streams: [
      {
        id: 27493,
        name: "Willow",
        tag: "24/7 channel",
        source_tag: "HD | Willow",
        uri_name: "247-willow",
        starts_at: -3600,
        ends_at: 10800,
        always_live: 1,
        locale: "en",
        category_name: "Cricket",
        iframe: "https://ppv.example/embed/247-willow",
        substreams: [],
      },
    ],
  },
];

const requestedPaths: string[] = [];

const installFetchMock = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      requestedPaths.push(`${url.origin}${url.pathname}`);

      let body: unknown;
      if (url.pathname === "/api/ping") {
        body = { success: true, domains: [], status: [] };
      } else if (url.pathname === "/api/streams") {
        body = { success: true, streams: ppvStreams };
      } else if (url.pathname === "/api/v1/streams") {
        body = { count: streamFreeStreams.length, streams: streamFreeStreams };
      } else if (url.pathname.startsWith("/api/v1/sources/")) {
        const key = decodeURIComponent(url.pathname.split("/").pop() || "");
        body = { stream_key: key, sources: streamFreeSources[key] ?? [] };
      } else {
        throw new Error(`Unexpected request: ${url}`);
      }

      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => body,
      } as Response;
    }),
  );
};

const loadApi = async () => {
  vi.resetModules();
  const module = await import("../services/api");
  return module.api;
};

describe("provider integrations", () => {
  beforeEach(() => {
    requestedPaths.length = 0;
    installFetchMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("turns StreamFree embeds and additional sources into playable links", async () => {
    const api = await loadApi();
    const matches = await api.getAllMatches();
    const skySports = matches.find((match) => match.id === "streamfree:skyf1");

    expect(skySports).toMatchObject({
      status: "live",
      provider: "streamfree",
      iframe: "https://strmfree.st/embed/racing/skyf11080p",
    });
    expect(skySports?.streamLinks).toHaveLength(1);
    expect(skySports?.streamLinks[0]).toMatchObject({
      iframe: "https://strmfree.st/embed/racing/skyf11080p",
      isLive: true,
      label: "Source 1 · FHD",
    });
    expect(requestedPaths).toContain("https://streamfree.top/api/v1/sources/skyf1");
  });

  it("merges a StreamFree duplicate into its PPV event without losing either feed", async () => {
    const api = await loadApi();
    const matches = await api.getAllMatches();
    const match = matches.find((item) => item.id === "101");

    expect(match?.provider).toBe("combined");
    expect(match?.status).toBe("live");
    const providerLinks = match?.streamLinks.map((link) => link.provider);
    expect(providerLinks).toEqual(["ppv", "ppv", "streamfree", "streamfree"]);
    expect(match?.streamLinks.map((link) => link.iframe)).toEqual([
      "https://ppv.example/embed/laliga/bar-vil",
      "https://ppv.example/embed/laliga/bar-vil_540p",
      "https://strmfree.st/embed/soccer/villarreal-vs-barcelona1080p",
      "https://strmfree.st/embed/soccer/villarreal-vs-barcelona1080p2",
    ]);
    expect(
      matches.some((item) => item.id === "streamfree:villarreal-vs-barcelona"),
    ).toBe(false);
  });

  it("keeps upcoming StreamFree events playable without mislabelling them as live", async () => {
    const api = await loadApi();
    const matches = await api.getAllMatches();
    const future = matches.find((match) => match.id === "streamfree:future-game");

    expect(future).toMatchObject({ status: "upcoming", provider: "streamfree" });
    expect(future?.streamLinks).toHaveLength(1);
    expect(future?.streamLinks[0]).toMatchObject({
      iframe: "https://strmfree.st/embed/soccer/future-game1080p",
      isLive: false,
    });
  });

  it("keeps PPV always-live channels and mirror discovery working", async () => {
    const api = await loadApi();
    const matches: APIMatch[] = await api.getAllMatches();
    const willow = matches.find((match) => match.id === "27493");

    expect(willow).toMatchObject({
      status: "live",
      provider: "ppv",
      alwaysLive: true,
    });
    expect(willow?.streamLinks).toHaveLength(1);
    expect(willow?.streamLinks[0].iframe).toBe(
      "https://ppv.example/embed/247-willow",
    );
    expect(requestedPaths).toContain("https://api.ppv.st/api/ping");
    expect(requestedPaths).toContain("https://api.ppv.st/api/streams");
  });
});
