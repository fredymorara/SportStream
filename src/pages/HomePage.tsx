import React, { useEffect, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import MatchGrid from '../components/MatchGrid';
import HeroSection from '../components/HeroSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMatchesByStatus,
} from '../store/matchesSlice';
import { fetchSportsCategories } from '../store/sportsSlice';
import type { APIMatch } from '../services/api';

import { Helmet } from 'react-helmet-async';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    rawMatches,
    loading,
    error,
    selectedSport,
    searchQuery,
  } = useAppSelector((state) => state.matches);

  useEffect(() => {
    dispatch(fetchSportsCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMatchesByStatus('all'));
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
      const isLive = m.status?.toLowerCase() === 'live' || (m.date <= currentTime && m.sources && m.sources.length > 0);
      if (isLive) return true;
      return m.date >= startOfToday.getTime() && m.date <= endOfTomorrow.getTime();
    });

    // Apply Search Query filter
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((m) => 
        m.title.toLowerCase().includes(lowerQuery) ||
        m.category?.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [rawMatches, searchQuery, currentTime]);

  // Categories definitions exactly as requested
  const categoryDefinitions = useMemo(() => [
    {
      id: 'popular_live',
      name: 'Popular Live',
      match: (m: APIMatch, isLive: boolean) => isLive && m.popular
    },
    {
      id: 'football',
      name: 'Football',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'football'
    },
    {
      id: 'basketball',
      name: 'Basketball',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'basketball'
    },
    {
      id: 'american_football',
      name: 'NFL / Am. Football',
      match: (m: APIMatch) => ['american football', 'nfl', 'american_football'].includes(m.category?.toLowerCase() || '')
    },
    {
      id: 'hockey',
      name: 'Hockey',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'hockey'
    },
    {
      id: 'baseball',
      name: 'Baseball',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'baseball'
    },
    {
      id: 'motor_sports',
      name: 'Motor Sports',
      match: (m: APIMatch) => ['motor sports', 'motorsport', 'motor-sports', 'formula 1', 'f1', 'nascar', 'motogp'].includes(m.category?.toLowerCase() || '')
    },
    {
      id: 'fight',
      name: 'Fight (UFC, Boxing)',
      match: (m: APIMatch) => ['fight', 'ufc', 'boxing', 'mma', 'wrestling', 'wwe'].includes(m.category?.toLowerCase() || '')
    },
    {
      id: 'tennis',
      name: 'Tennis',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'tennis'
    },
    {
      id: 'rugby',
      name: 'Rugby',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'rugby'
    },
    {
      id: 'golf',
      name: 'Golf',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'golf'
    },
    {
      id: 'afl',
      name: 'AFL',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'afl'
    },
    {
      id: 'cricket',
      name: 'Cricket',
      match: (m: APIMatch) => m.category?.toLowerCase() === 'cricket'
    },
    {
      id: 'other',
      name: 'Other Sports',
      match: (_m: APIMatch, _isLive: boolean, matchedInCategories: boolean) => !matchedInCategories
    }
  ], []);

  const categorizedSections = useMemo(() => {
    const matchedInCategoriesMatchIds = new Set<string>();

    const sportSections = categoryDefinitions
      .filter((catDef) => catDef.id !== 'other')
      .map((catDef) => {
        const matches = filteredMatches.filter((m) => {
          const isLive = m.status?.toLowerCase() === 'live' || (m.date <= currentTime && m.sources && m.sources.length > 0);
          const isMatch = catDef.match(m, isLive, false);
          if (isMatch && catDef.id !== 'popular_live') {
            matchedInCategoriesMatchIds.add(m.id);
          }
          return isMatch;
        });

        const live: APIMatch[] = [];
        const upcoming: APIMatch[] = [];

        matches.forEach((m) => {
          const isLive = m.status?.toLowerCase() === 'live' || (m.date <= currentTime && m.sources && m.sources.length > 0);
          if (isLive) {
            live.push(m);
          } else {
            upcoming.push(m);
          }
        });

        live.sort((a, b) => {
          if (catDef.id === 'popular_live') {
            const aIsFootball = a.category?.toLowerCase() === 'football';
            const bIsFootball = b.category?.toLowerCase() === 'football';
            if (aIsFootball && !bIsFootball) return -1;
            if (!aIsFootball && bIsFootball) return 1;
          }
          return a.date - b.date;
        });
        upcoming.sort((a, b) => {
          if (catDef.id === 'popular_live') {
            const aIsFootball = a.category?.toLowerCase() === 'football';
            const bIsFootball = b.category?.toLowerCase() === 'football';
            if (aIsFootball && !bIsFootball) return -1;
            if (!aIsFootball && bIsFootball) return 1;
          }
          return a.date - b.date;
        });

        return {
          ...catDef,
          matches: [...live, ...upcoming]
        };
      });

    const otherDef = categoryDefinitions.find((c) => c.id === 'other');
    const otherSection = otherDef ? {
      ...otherDef,
      matches: filteredMatches.filter((m) => {
        const hasMatchedSport = matchedInCategoriesMatchIds.has(m.id);
        return otherDef.match(m, false, hasMatchedSport);
      })
    } : null;

    if (otherSection) {
      const live: APIMatch[] = [];
      const upcoming: APIMatch[] = [];

      otherSection.matches.forEach((m) => {
        const isLive = m.status?.toLowerCase() === 'live' || (m.date <= currentTime && m.sources && m.sources.length > 0);
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

    const sections = otherSection ? [...sportSections, otherSection] : sportSections;

    if (selectedSport !== 'all') {
      return sections.filter((sec) => sec.id === selectedSport || sec.name.toLowerCase().includes(selectedSport));
    }

    return sections.filter((sec) => sec.matches.length > 0);
  }, [filteredMatches, categoryDefinitions, selectedSport, currentTime]);

  const filterProps = {};

  const featuredMatch = useMemo(() => {
    // 1. Live, Popular, Football
    const livePopularFootball = filteredMatches.find((m) => {
      const isLive = m.status?.toLowerCase() === 'live' || (m.date <= currentTime && m.sources && m.sources.length > 0);
      return isLive && m.popular && m.category?.toLowerCase() === 'football';
    });
    if (livePopularFootball) return livePopularFootball;

    // 2. Live, Popular (any sport)
    const livePopular = filteredMatches.find((m) => {
      const isLive = m.status?.toLowerCase() === 'live' || (m.date <= currentTime && m.sources && m.sources.length > 0);
      return isLive && m.popular;
    });
    if (livePopular) return livePopular;

    const liveAny = filteredMatches.find((m) => {
      return m.status?.toLowerCase() === 'live' || (m.date <= currentTime && m.sources && m.sources.length > 0);
    });
    if (liveAny) return liveAny;

    if (filteredMatches.length > 0) return filteredMatches[0];
    return null;
  }, [filteredMatches, currentTime]);

  if (loading) {
    return (
      <MainLayout filterProps={filterProps}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in-up">
          <LoadingSpinner color="#10B981" size="240" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout filterProps={filterProps}>
        <div className="text-center py-16 flex flex-col items-center justify-center min-h-[40vh] animate-fade-in-up border-t border-white/5 mt-8">
          <div className="bg-red-500/10 p-4 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-white text-lg font-bold mb-2">Failed to load content</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout filterProps={filterProps}>
      <Helmet>
        <title>Mpira | Live Premium Sports Streaming</title>
        <meta name="description" content="Watch high-definition live sports streams completely free. Follow football, basketball, MMA, and more live matches from around the world." />
        <meta property="og:title" content="Mpira | Live Premium Sports Streaming" />
        <meta property="og:description" content="Watch high-definition live sports streams completely free. Follow football, basketball, MMA, and more live matches from around the world." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mpira | Live Premium Sports Streaming" />
        <meta name="twitter:description" content="Watch high-definition live sports streams completely free." />
      </Helmet>

      <HeroSection featuredMatch={featuredMatch} />

      {categorizedSections.length > 0 ? (
        <div className="space-y-4">
          {categorizedSections.map((section) => (
            <MatchGrid key={section.id} section={section} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 flex flex-col items-center justify-center min-h-[40vh] border-t border-white/5 mt-8">
          <div className="mb-4 bg-zinc-900 p-4 rounded-full">
            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-white font-semibold text-xl mb-2">No matches found</p>
          <p className="text-zinc-500 text-sm">Try adjusting your search criteria or checking back later.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 pt-8 pb-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm gap-4">
        <p>© {new Date().getFullYear()} SportStream. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
        </div>
      </footer>
    </MainLayout>
  );
};

export default HomePage;