import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, Sport } from '../services/api';

export const fetchSportsCategories = createAsyncThunk(
  'sports/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getSports();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch sports.');
    }
  }
);

interface SportsState {
  list: Sport[];
  loading: boolean;
  error: string | null;
}

const initialState: SportsState = { list: [], loading: false, error: null };

const sportsSlice = createSlice({
  name: 'sports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSportsCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchSportsCategories.fulfilled, (state, action: PayloadAction<Sport[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSportsCategories.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default sportsSlice.reducer;