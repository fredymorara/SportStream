import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";

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
  selectedSport: string;
  searchQuery: string;
}

const initialState: MatchesState = {
  rawMatches: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedSport: "all",
  searchQuery: "",
};

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    setSelectedSport: (state, action: PayloadAction<string>) => {
      state.selectedSport = action.payload;
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

export const { setSelectedSport, setSearchQuery } = matchesSlice.actions;

export default matchesSlice.reducer;
