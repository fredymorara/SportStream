import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import MatchCard from '../components/MatchCard';
import HeroSection from '../components/HeroSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMatchesByStatus,
  setSelectedSport,
} from '../store/matchesSlice';
import { fetchSportsCategories } from '../store/sportsSlice';
import type { APIMatch } from '../services/api';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');


  const {
    rawMatches,
    loading,
    error,
    selectedSport,
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

        live.sort((a, b) => a.date - b.date);
        upcoming.sort((a, b) => a.date - b.date);

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

  const filterProps = {
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    selectedSport,
    onSportChange: (val: string) => dispatch(setSelectedSport(val)),
  };

  const featuredMatch = useMemo(() => {
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
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner color="#99ec09" size="800" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout filterProps={filterProps}>
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
          <p className="text-red-500 text-lg font-medium">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout filterProps={filterProps}>
      <HeroSection featuredMatch={featuredMatch} />

      {categorizedSections.length > 0 ? (
        categorizedSections.map((section) => (
          <div key={section.id} className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              {section.id === 'popular_live' && (
                <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
              )}
              <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight">
                {section.name}
              </h3>
              <span className="text-xs font-semibold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg backdrop-blur-sm">
                {section.matches.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {section.matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800/80">
          <p className="text-slate-400 font-medium text-lg">No matches available matching your search criteria.</p>
        </div>
      )}
    </MainLayout>
  );
};

export default HomePage;