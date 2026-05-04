import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../services/api';
import type { APIMatch } from '../services/api';
import type { RootState } from './index';

export const fetchMatchesByStatus = createAsyncThunk(
  'matches/fetchByStatus',
  async (status: string, { rejectWithValue }) => {
    try {
      if (status === 'live') return await api.getLiveMatches();
      if (status === 'today') return await api.getTodayMatches();
      return await api.getAllMatches();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch matches.');
    }
  }
);

interface MatchesState {
  rawMatches: APIMatch[];
  loading: boolean;
  error: string | null;
  selectedStatus: string;
  selectedSport: string;
  showHdOnly: boolean;
  showPopularOnly: boolean;
  sortBy: 'date' | 'sport';
  sortOrder: 'asc' | 'desc';
}

const initialState: MatchesState = {
  rawMatches: [],
  loading: false,
  error: null,
  selectedStatus: 'all',
  selectedSport: 'all',
  showHdOnly: false,
  showPopularOnly: false,
  sortBy: 'date',
  sortOrder: 'asc'
};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setSelectedStatus: (state, action: PayloadAction<string>) => { state.selectedStatus = action.payload; },
    setSelectedSport: (state, action: PayloadAction<string>) => { state.selectedSport = action.payload; },
    setShowHdOnly: (state, action: PayloadAction<boolean>) => { state.showHdOnly = action.payload; },
    setShowPopularOnly: (state, action: PayloadAction<boolean>) => { state.showPopularOnly = action.payload; },
    setSortBy: (state, action: PayloadAction<'date' | 'sport'>) => { state.sortBy = action.payload; },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => { state.sortOrder = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchesByStatus.fulfilled, (state, action: PayloadAction<APIMatch[]>) => {
        state.loading = false;
        state.rawMatches = action.payload;
      })
      .addCase(fetchMatchesByStatus.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedStatus, setSelectedSport, setShowHdOnly,
  setShowPopularOnly, setSortBy, setSortOrder
} = matchesSlice.actions;

export const selectFilteredAndSortedMatches = (state: RootState) => {
  const { rawMatches, selectedSport, showHdOnly, showPopularOnly, sortBy, sortOrder } = state.matches;

  let filtered = [...rawMatches];

  if (selectedSport !== 'all') {
    filtered = filtered.filter(
      (m) => m.category && m.category.toLowerCase() === selectedSport
    );
  }

  if (showHdOnly) {
    filtered = filtered.filter(
      (m) => m.sources && m.sources.some((s) => s.hd)
    );
  }

  if (showPopularOnly) {
    filtered = filtered.filter((m) => m.popular);
  }

  const currentTime = Date.now();
  const live: APIMatch[] = [];
  const upcoming: APIMatch[] = [];

  filtered.forEach((m) => {
    const isTaggedLive = m.status && m.status.toLowerCase() === 'live';
    const hasReachedTimeAndHasStreams = m.date <= currentTime && m.sources && m.sources.length > 0;

    if (isTaggedLive || hasReachedTimeAndHasStreams) {
      live.push(m);
    } else {
      upcoming.push(m);
    }
  });

  const sortCollection = (arr: APIMatch[]) => {
    return arr.sort((a, b) => {
      const isFootballA = a.category && a.category.toLowerCase() === 'football';
      const isFootballB = b.category && b.category.toLowerCase() === 'football';

      if (isFootballA && !isFootballB) return -1;
      if (!isFootballA && isFootballB) return 1;

      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;

      if (sortBy === 'date') {
        return sortOrder === 'asc' ? a.date - b.date : b.date - a.date;
      }
      if (sortBy === 'sport') {
        return (a.category || '').localeCompare(b.category || '');
      }
      return 0;
    });
  };

  return { liveMatches: sortCollection(live), upcomingMatches: sortCollection(upcoming) };
};

export default matchesSlice.reducer;