import React, { useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import MatchGrid from "../components/MatchGrid";
import HeroSection from "../components/HeroSection";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatchesByStatus } from "../store/matchesSlice";
import type { APIMatch } from "../services/api";

import { Helmet } from "react-helmet-async";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { rawMatches, loading, error, selectedSport, searchQuery } =
    useAppSelector((state) => state.matches);

  useEffect(() => {
    dispatch(fetchMatchesByStatus("all"));
    const refreshInterval = window.setInterval(() => {
      dispatch(fetchMatchesByStatus("all"));
    }, 60_000);
    return () => window.clearInterval(refreshInterval);
  }, [dispatch]);

  const currentTime = Date.now();

  // Filter matches within Today & Tomorrow time window + match toolbar flags + search text
  const filteredMatches = useMemo(() => {
    let filtered = [...rawMatches];

    // Determine Today & Tomorrow boundaries in user local time
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date();
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    filtered = filtered.filter((m) => {
      const isLive = m.status === "live";
      if (isLive) return true;
      return (
        m.date >= startOfToday.getTime() && m.date <= endOfTomorrow.getTime()
      );
    });

    // Apply Search Query filter
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(lowerQuery) ||
          m.category?.toLowerCase().includes(lowerQuery),
      );
    }

    return filtered;
  }, [rawMatches, searchQuery, currentTime]);

  // Categories definitions exactly as requested
  const categoryDefinitions = useMemo(
    () => [
      {
        id: "live",
        name: "Live Now",
        match: (_m: APIMatch, isLive: boolean) => isLive,
      },
      {
        id: "football",
        name: "Football",
        match: (m: APIMatch) => m.category?.toLowerCase() === "football",
      },
      {
        id: "basketball",
        name: "Basketball",
        match: (m: APIMatch) => m.category?.toLowerCase() === "basketball",
      },
      {
        id: "baseball",
        name: "Baseball",
        match: (m: APIMatch) => m.category?.toLowerCase() === "baseball",
      },
      {
        id: "other",
        name: "Others",
        match: (_m: APIMatch, _isLive: boolean, matchedInCategories: boolean) =>
          !matchedInCategories,
      },
    ],
    [],
  );

  const categorizedSections = useMemo(() => {
    const matchedInCategoriesMatchIds = new Set<string>();

    const sportSections = categoryDefinitions
      .filter((catDef) => catDef.id !== "other")
      .map((catDef) => {
        const matches = filteredMatches.filter((m) => {
          const isLive = m.status === "live";
          const isMatch = catDef.match(m, isLive, false);
          if (isMatch && catDef.id !== "live") {
            matchedInCategoriesMatchIds.add(m.id);
          }
          return isMatch;
        });

        const live: APIMatch[] = [];
        const upcoming: APIMatch[] = [];

        matches.forEach((m) => {
          const isLive = m.status === "live";
          if (isLive) {
            live.push(m);
          } else {
            upcoming.push(m);
          }
        });

        live.sort((a, b) => {
          if (catDef.id === "live") {
            const aIsFootball = a.category?.toLowerCase() === "football";
            const bIsFootball = b.category?.toLowerCase() === "football";
            if (aIsFootball && !bIsFootball) return -1;
            if (!aIsFootball && bIsFootball) return 1;
          }
          return a.date - b.date;
        });
        upcoming.sort((a, b) => {
          if (catDef.id === "live") {
            const aIsFootball = a.category?.toLowerCase() === "football";
            const bIsFootball = b.category?.toLowerCase() === "football";
            if (aIsFootball && !bIsFootball) return -1;
            if (!aIsFootball && bIsFootball) return 1;
          }
          return a.date - b.date;
        });

        return {
          ...catDef,
          matches: [...live, ...upcoming],
        };
      });

    const otherDef = categoryDefinitions.find((c) => c.id === "other");
    const otherSection = otherDef
      ? {
          ...otherDef,
          matches: filteredMatches.filter((m) => {
            const hasMatchedSport = matchedInCategoriesMatchIds.has(m.id);
            return otherDef.match(m, false, hasMatchedSport);
          }),
        }
      : null;

    if (otherSection) {
      const live: APIMatch[] = [];
      const upcoming: APIMatch[] = [];

      otherSection.matches.forEach((m) => {
        const isLive = m.status === "live";
        if (isLive) {
          live.push(m);
        } else {
          upcoming.push(m);
        }
      });

      live.sort((a, b) => a.date - b.date);
      upcoming.sort((a, b) => a.date - b.date);
      otherSection.matches = [...live, ...upcoming];
    }

    const sections = otherSection
      ? [...sportSections, otherSection]
      : sportSections;

    if (selectedSport !== "all") {
      return sections.filter((sec) => sec.id === selectedSport);
    }

    return sections.filter((sec) => sec.matches.length > 0);
  }, [filteredMatches, categoryDefinitions, selectedSport, currentTime]);

  const featuredMatch = useMemo(() => {
    const isHeroEligible = (match: APIMatch) =>
      !/red\s*zone/i.test(
        [match.title, match.uriName, match.tag || ""].join(" "),
      );

    const footballEvents = rawMatches
      .filter(
        (match) =>
          isHeroEligible(match) &&
          match.category?.trim().toLowerCase() === "football" &&
          (match.status !== "ended" || match.allowPastStreams),
      )
      .sort((a, b) => {
        const statusPriority = (status: APIMatch["status"]) =>
          status === "live" ? 0 : status === "upcoming" ? 1 : 2;
        const priorityDifference =
          statusPriority(a.status) - statusPriority(b.status);
        if (priorityDifference !== 0) return priorityDifference;
        return a.status === "ended" ? b.date - a.date : a.date - b.date;
      });
    if (footballEvents.length > 0) return footballEvents[0];

    const heroEligibleMatches = filteredMatches.filter(isHeroEligible);
    const liveAny = heroEligibleMatches.find((m) => {
      return m.status === "live";
    });
    if (liveAny) return liveAny;

    if (heroEligibleMatches.length > 0) return heroEligibleMatches[0];
    return null;
  }, [rawMatches, filteredMatches, currentTime]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center">
          <LoadingSpinner color="#10B981" size="240" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="mt-8 flex min-h-[40vh] flex-col items-center justify-center border-t border-white/5 py-16 text-center">
          <div className="bg-red-500/10 p-4 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-white text-lg font-bold mb-2">
            Failed to load content
          </p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>SportStream | Live Premium Sports Streaming</title>
        <meta
          name="description"
          content="Watch high-definition live sports streams completely free. Follow football, basketball, MMA, and more live matches from around the world."
        />
        <meta
          property="og:title"
          content="SportStream | Live Premium Sports Streaming"
        />
        <meta
          property="og:description"
          content="Watch high-definition live sports streams completely free. Follow football, basketball, MMA, and more live matches from around the world."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="SportStream | Live Premium Sports Streaming"
        />
        <meta
          name="twitter:description"
          content="Watch high-definition live sports streams completely free."
        />
      </Helmet>

      {selectedSport === "all" ? (
        <HeroSection featuredMatch={featuredMatch} />
      ) : (
        <section className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {selectedSport === "live"
                  ? "Live now"
                  : selectedSport === "other"
                    ? "Other sports"
                    : `${selectedSport.charAt(0).toUpperCase()}${selectedSport.slice(1)} events`}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                {selectedSport === "live"
                  ? "Follow every event currently in progress."
                  : `Browse live and upcoming ${selectedSport === "other" ? "sports" : selectedSport} events in one place.`}
              </p>
            </div>
            <span className="hidden shrink-0 text-sm font-medium text-zinc-500 sm:block">
              {categorizedSections.reduce(
                (total, section) => total + section.matches.length,
                0,
              )}{" "}
              events
            </span>
          </div>
        </section>
      )}

      {categorizedSections.length > 0 ? (
        <div className="space-y-4">
          {categorizedSections.map((section) => (
            <MatchGrid key={section.id} section={section} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 flex flex-col items-center justify-center min-h-[40vh] border-t border-white/5 mt-8">
          <div className="mb-4 bg-zinc-900 p-4 rounded-full">
            <svg
              className="w-8 h-8 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-white font-semibold text-xl mb-2">
            No matches found
          </p>
          <p className="text-zinc-500 text-sm">
            Try adjusting your search criteria or checking back later.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 pt-8 pb-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm gap-4">
        <p>© {new Date().getFullYear()} SportStream. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-emerald-400 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-emerald-400 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-emerald-400 transition-colors">
            Contact
          </a>
        </div>
      </footer>
    </MainLayout>
  );
};

export default HomePage;
