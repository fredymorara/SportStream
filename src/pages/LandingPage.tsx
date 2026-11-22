import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";
import EventArt from "../components/EventArt";
import ScoreBug from "../components/ScoreBug";
import { parseMatchup } from "../utils/matchup";
import "../landing.css";

const isFixtureWithArt = (match: APIMatch) =>
  Boolean(parseMatchup(match.title)) && Boolean(match.poster);

const LandingPage: React.FC = () => {
  const [matches, setMatches] = useState<APIMatch[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const fetchMatches = useCallback((forceRefresh = false) => {
    api
      .getAllMatches(forceRefresh)
      .then((data) => {
        const ranked = [...data].sort((a, b) => {
          const weight = (m: APIMatch) =>
            m.status === "live" ? 0 : m.status === "upcoming" ? 1 : 2;
          return weight(a) - weight(b) || a.date - b.date;
        });
        setMatches(ranked);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const load = useCallback(
    (forceRefresh = false) => {
      setStatus("loading");
      fetchMatches(forceRefresh);
    },
    [fetchMatches],
  );

  useEffect(() => {
    fetchMatches(false);
  }, [fetchMatches]);

  const liveCount = matches.filter((match) => match.status === "live").length;
  const featured = useMemo(
    () =>
      matches.find((match) => match.status === "live" && isFixtureWithArt(match)) ??
      matches.find(isFixtureWithArt) ??
      matches.find((match) => Boolean(match.poster)) ??
      matches[0] ??
      null,
    [matches],
  );
  const posterWall = useMemo(
    () => matches.filter((match) => match.poster).slice(0, 6),
    [matches],
  );
  const heroPeek = useMemo(
    () => matches.filter((match) => match.poster && match.id !== featured?.id).slice(0, 3),
    [matches, featured],
  );

  return (
    <div className="landing min-h-screen bg-pitch text-ink">
      <Helmet>
        <title>SportStream: live fixtures, on air</title>
        <meta
          name="description"
          content="An educational project for finding live and upcoming sports fixtures from third-party sources, grouped by sport and nearest kickoff."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:text-ink-inverse"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-pitch/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:px-10">
          <Link to="/app" className="flex shrink-0 items-center gap-2.5" aria-label="SportStream home">
            <span aria-hidden="true" className="h-3 w-3 bg-signal" />
            <span className="font-display text-3xl font-extrabold lowercase tracking-tight">
              sportstream
            </span>
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
            <a href="#sports" className="font-display text-sm font-semibold uppercase tracking-wider text-muted hover:text-accent">Sports</a>
            <a href="#how" className="font-display text-sm font-semibold uppercase tracking-wider text-muted hover:text-accent">How it works</a>
            <a href="#questions" className="font-display text-sm font-semibold uppercase tracking-wider text-muted hover:text-accent">Questions</a>
          </nav>
          <Link
            to="/app"
            className="sig-stamp ml-auto bg-accent px-5 py-2.5 text-xs text-ink-inverse hover:bg-accent-hover"
          >
            Open the board
          </Link>
        </div>
      </header>

      <main id="main">
        <section className="relative overflow-hidden border-b border-border">
          {status === "ready" && featured && (
            <div className="landing-hero-art absolute inset-0">
              <EventArt match={featured} eager className="h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-pitch via-pitch/70 to-transparent" />
              </EventArt>
            </div>
          )}

          <div className="relative mx-auto flex min-h-[clamp(500px,68vh,720px)] max-w-[1600px] flex-col justify-between px-4 pb-10 pt-12 sm:px-6 lg:px-10">
            {status === "error" ? (
              <div className="my-auto max-w-xl border-l-2 border-signal pl-6">
                <span className="sig-stamp bg-live-badge px-3 py-1 text-xs text-white">
                  Signal lost
                </span>
                <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6rem)] font-extrabold uppercase leading-[0.85] text-ink">
                  The fixture feed is off air
                </h1>
                <p className="mt-4 max-w-md text-sm text-muted">
                  The upstream APIs did not respond. Retry, or open the board to
                  see the last available fixtures.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => load(true)}
                    className="sig-stamp bg-live-badge px-7 py-3 text-sm text-white hover:bg-signal"
                  >
                    Retry feed
                  </button>
                  <Link
                    to="/app"
                    className="sig-stamp border border-border-bright px-7 py-3 text-sm text-ink hover:border-accent"
                  >
                    Open the board
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="max-w-4xl">
                  <h1 className="font-display text-[clamp(3.25rem,9vw,8rem)] font-extrabold uppercase leading-[0.82] tracking-tight text-ink">
                    Find your match.
                    <br />
                    <span className="text-accent">See it on air.</span>
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/85 sm:text-lg">
                    SportStream pulls fixtures from two public APIs, groups them
                    by sport, and orders them by the nearest kickoff. Every
                    poster and crest below comes straight from those feeds.
                  </p>

                  {status === "ready" && featured && (
                    <div className="mt-7 max-w-3xl border border-border-bright bg-pitch/70 p-4 sm:p-5">
                      <ScoreBug match={featured} compact />
                    </div>
                  )}

                  {status === "ready" && heroPeek.length > 0 && (
                    <div className="mt-6 flex gap-2" role="group" aria-label="More live artwork">
                      {heroPeek.map((match) => (
                        <EventArt
                          key={match.id}
                          match={match}
                          className="h-14 w-20 border border-border-bright sm:h-16 sm:w-24"
                        />
                      ))}
                    </div>
                  )}

                  {status === "loading" && (
                    <p className="sig-stamp mt-7 text-sm text-accent">Tuning in…</p>
                  )}

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <Link
                      to="/app"
                      className="sig-stamp bg-live-badge px-8 py-4 text-sm text-white hover:bg-signal"
                    >
                      Find your match
                    </Link>
                    <a
                      href="#how"
                      className="sig-stamp border border-border-bright px-8 py-4 text-sm text-ink hover:border-accent"
                    >
                      See how it works
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-10 gap-y-2 px-4 py-4 sm:px-6 lg:px-10">
            {[
              "2 public fixture sources",
              "Refreshed every 60 seconds",
              `${liveCount} feeds on air`,
              "No account needed",
            ].map((label) => (
              <span key={label} className="flex items-center gap-3 font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
                {label}
              </span>
            ))}
          </div>
        </section>

        <section id="sports" className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
              From the feed
            </h2>
            <p className="max-w-md text-sm text-muted">
              Real event artwork from the upstream APIs. No invented posters, no
              stock photography.
            </p>
          </div>

          {posterWall.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {posterWall.map((match) => (
                <Link
                  key={match.id}
                  to="/app"
                  className="group relative block border border-border hover:border-accent"
                >
                  <EventArt match={match} className="aspect-[3/4] w-full">
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pitch to-transparent px-3 pb-3 pt-10">
                      <span className="block font-display text-sm font-bold uppercase leading-tight text-ink group-hover:text-accent">
                        {match.title}
                      </span>
                      <span className="mt-1 block truncate font-display text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {match.tag || match.category}
                      </span>
                    </span>
                    <span
                      className={`sig-stamp absolute left-2 top-2 px-2 py-0.5 text-[11px] ${
                        match.status === "live"
                          ? "bg-live-badge text-white"
                          : "bg-pitch/80 text-accent"
                      }`}
                    >
                      {match.status === "live" ? "Live" : "Upcoming"}
                    </span>
                  </EventArt>
                </Link>
              ))}
            </div>
          ) : (
            <p className="border border-border px-5 py-10 text-center text-sm text-muted">
              {status === "error"
                ? "The feed is unavailable. Retry above to load the artwork."
                : "The fixture feed is waking up. Check back in a moment."}
            </p>
          )}
        </section>

        <section id="how" className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-10">
            <div>
              <h2 className="font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
                Three steps
              </h2>
              <p className="mt-4 max-w-md text-sm text-muted">
                No account, no setup. The board is built for the thirty seconds
                before kickoff.
              </p>
            </div>
            <ol className="divide-y divide-border border-y border-border">
              {[
                ["01", "Pick your sport", "The board shows that sport and nothing else, with its own real artwork."],
                ["02", "Read the order", "Live first, then starting soon, then the rest of today and tomorrow."],
                ["03", "Check the feed", "Every row says LIVE, WAITING or ENDED before you open the player."],
              ].map(([number, title, copy]) => (
                <li key={number} className="grid grid-cols-[56px_1fr] gap-4 py-5 sm:grid-cols-[72px_1fr]">
                  <span className="font-display text-3xl font-extrabold text-accent">{number}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-ink">{title}</h3>
                    <p className="mt-1 text-sm text-muted">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="questions" className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
          <div className="mb-8 border-b-2 border-ink pb-4">
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
              The facts, plainly
            </h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              ["Does SportStream host streams?", "No. Fixtures and feeds come from public third-party APIs. Copyright belongs to the original sources."],
              ["Why is a fixture listed without a stream?", "Some sources publish a fixture before a feed is available. The row says WAITING so you know before you open it."],
              ["Can I search for a team?", "Yes. Search matches teams, competitions and leagues across every sport board."],
            ].map(([question, answer]) => (
              <div key={question}>
                <h3 className="font-display text-xl font-bold uppercase text-ink">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{answer}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 border-l-2 border-signal pl-5 text-sm text-muted">
            This is an educational project. SportStream does not create, host or
            provide streams; playback uses sources returned by third-party APIs.
          </p>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Ready when you are
            </p>
            <p className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
              {liveCount} live right now
            </p>
          </div>
          <Link
            to="/app"
            className="sig-stamp w-fit bg-accent px-7 py-3.5 text-sm text-ink-inverse hover:bg-accent-hover"
          >
            Open the board
          </Link>
        </div>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 border-t border-border px-4 py-5 text-xs text-muted sm:flex-row sm:justify-between sm:px-6 lg:px-10">
          <span>© {new Date().getFullYear()} SportStream. Educational project.</span>
          <span>Events and streams come from third-party sources.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
