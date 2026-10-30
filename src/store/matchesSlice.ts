import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";
import type { RootState } from "./index";

export const fetchMatchesByStatus = createAsyncThunk(
  "matches/fetchByStatus",
  async (
    request: { status: string; forceRefresh?: boolean },
    { rejectWithValue },
  ) => {
    try {
      return await api.getAllMatches(request.forceRefresh);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch matches.",
      );
    }
  },
);

interface MatchesState {
  rawMatches: APIMatch[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  selectedStatus: string;
  selectedSport: string;
  sortBy: "date" | "sport";
  sortOrder: "asc" | "desc";
  searchQuery: string;
}

const initialState: MatchesState = {
  rawMatches: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedStatus: "all",
  selectedSport: "all",
  sortBy: "date",
  sortOrder: "asc",
  searchQuery: "",
};

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    setSelectedStatus: (state, action: PayloadAction<string>) => {
      state.selectedStatus = action.payload;
    },
    setSelectedSport: (state, action: PayloadAction<string>) => {
      state.selectedSport = action.payload;
    },
    setSortBy: (state, action: PayloadAction<"date" | "sport">) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchesByStatus.pending, (state) => {
        if (state.rawMatches.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMatchesByStatus.fulfilled,
        (state, action: PayloadAction<APIMatch[]>) => {
          state.loading = false;
          state.rawMatches = action.payload;
          state.lastUpdated = Date.now();
        },
      )
      .addCase(fetchMatchesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message || "Failed to fetch matches.";
      });
  },
});

export const {
  setSelectedStatus,
  setSelectedSport,
  setSortBy,
  setSortOrder,
  setSearchQuery,
} = matchesSlice.actions;

export const selectFilteredAndSortedMatches = (state: RootState) => {
  const { rawMatches, selectedSport, sortBy, sortOrder } = state.matches;

  let filtered = [...rawMatches];

  if (selectedSport !== "all") {
    filtered = filtered.filter(
      (m) => m.category && m.category.toLowerCase() === selectedSport,
    );
  }

  const live: APIMatch[] = [];
  const upcoming: APIMatch[] = [];

  filtered.forEach((m) => {
    if (m.status === "live") {
      live.push(m);
    } else {
      upcoming.push(m);
    }
  });

  const sortCollection = (arr: APIMatch[]) => {
    return arr.sort((a, b) => {
      const isFootballA = a.category && a.category.toLowerCase() === "football";
      const isFootballB = b.category && b.category.toLowerCase() === "football";

      if (isFootballA && !isFootballB) return -1;
      if (!isFootballA && isFootballB) return 1;

      if (sortBy === "date") {
        return sortOrder === "asc" ? a.date - b.date : b.date - a.date;
      }
      if (sortBy === "sport") {
        return (a.category || "").localeCompare(b.category || "");
      }
      return 0;
    });
  };

  return {
    liveMatches: sortCollection(live),
    upcomingMatches: sortCollection(upcoming),
  };
};

export default matchesSlice.reducer;
