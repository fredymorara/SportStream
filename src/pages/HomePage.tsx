import React, { useEffect, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import MatchCard from '../components/MatchCard';
import HeroSection from '../components/HeroSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMatchesByStatus,
  setSelectedSport,
  setSelectedStatus,
  setShowHdOnly,
  setShowPopularOnly,
  setSortBy,
  setSortOrder,
  selectFilteredAndSortedMatches
} from '../store/matchesSlice';
import { fetchSportsCategories } from '../store/sportsSlice';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Read state from Redux using our typed hooks
  const { list: sports } = useAppSelector((state) => state.sports);
  const {
    loading,
    error,
    selectedSport,
    selectedStatus,
    showHdOnly,
    showPopularOnly,
    sortBy,
    sortOrder
  } = useAppSelector((state) => state.matches);

  // Instant memoized filtering directly in the selector
  const { liveMatches, upcomingMatches } = useAppSelector(selectFilteredAndSortedMatches);

  useEffect(() => {
    dispatch(fetchSportsCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMatchesByStatus(selectedStatus));
  }, [dispatch, selectedStatus]);

  const filterProps = {
    sports,
    selectedSport,
    onSportChange: (val: string) => dispatch(setSelectedSport(val)),
    selectedStatus,
    onStatusChange: (val: string) => dispatch(setSelectedStatus(val)),
    showHdOnly,
    onShowHdOnlyChange: (val: boolean) => dispatch(setShowHdOnly(val)),
    showPopularOnly,
    onShowPopularOnlyChange: (val: boolean) => dispatch(setShowPopularOnly(val)),
    sortBy,
    onSortByChange: (val: 'date' | 'sport') => dispatch(setSortBy(val)),
    sortOrder,
    onSortOrderChange: (val: 'asc' | 'desc') => dispatch(setSortOrder(val)),
  };

  const featuredMatch = useMemo(() => {
    if (liveMatches.length > 0) {
      return liveMatches.find((match) => match.popular) || liveMatches[0];
    } else if (upcomingMatches.length > 0) {
      return upcomingMatches[0];
    }
    return null;
  }, [liveMatches, upcomingMatches]);

  const getPageTitle = () => {
    switch (selectedStatus) {
      case "live": return "Live Matches";
      case "today": return "Today's Matches";
      case "upcoming": return "Upcoming Matches";
      default: return "All Matches";
    }
  };

  if (loading) {
    return (
      <MainLayout filterProps={filterProps}>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner color="#99ec09" size="80" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout filterProps={filterProps}>
      <HeroSection featuredMatch={featuredMatch} />

      <h2 className="text-white text-2xl md:text-3xl font-bold mb-6 tracking-tight drop-shadow-md">
        {getPageTitle()}
      </h2>

      {/* Live Section */}
      {selectedStatus !== 'upcoming' && (
        <div className="mb-12">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
            <h3 className="text-white text-xl md:text-2xl font-bold">Live Streams</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveMatches.length > 0 ? (
              liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-medium">No live events available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {selectedStatus !== 'live' && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="text-white text-xl md:text-2xl font-bold">Upcoming Matches</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-medium">No upcoming matches scheduled.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default HomePage;