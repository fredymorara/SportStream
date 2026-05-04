import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, APIMatch, Stream } from '../services/api';

export const fetchMatchStreams = createAsyncThunk(
  'streams/fetchByMatch',
  async (match: APIMatch, { rejectWithValue }) => {
    try {
      const fetchedStreamsBySource: Record<string, Stream[]> = {};
      if (match && match.sources) {
        for (const source of match.sources) {
          try {
            const streamList = await api.getStreams(source.source, source.id);

            streamList.sort((a, b) => {
              const getPriority = (s: Stream) => {
                if (s.source === 'echo' && s.hd) return 3;
                if (s.source === 'admin') return 2;
                return 1;
              };

              const priorityA = getPriority(a);
              const priorityB = getPriority(b);

              if (priorityA !== priorityB) return priorityB - priorityA;
              if (a.hd !== b.hd) return a.hd ? -1 : 1;
              return a.streamNo - b.streamNo;
            });

            fetchedStreamsBySource[source.source] = streamList;
          } catch (err) {
            fetchedStreamsBySource[source.source] = [];
          }
        }
      }
      return fetchedStreamsBySource;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch streams.');
    }
  }
);

interface StreamsState {
  streamsBySource: Record<string, Stream[]>;
  loading: boolean;
  error: string | null;
}

const initialState: StreamsState = {
  streamsBySource: {},
  loading: false,
  error: null
};

const streamsSlice = createSlice({
  name: 'streams',
  initialState,
  reducers: {
    clearStreams: (state) => {
      state.streamsBySource = {};
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchStreams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchStreams.fulfilled, (state, action: PayloadAction<Record<string, Stream[]>>) => {
        state.loading = false;
        state.streamsBySource = action.payload;
      })
      .addCase(fetchMatchStreams.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearStreams } = streamsSlice.actions;
export default streamsSlice.reducer;