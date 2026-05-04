import { configureStore } from '@reduxjs/toolkit';
import matchesReducer from './matchesSlice';
import sportsReducer from './sportsSlice';
import streamsReducer from './streamsSlice';

export const store = configureStore({
  reducer: {
    matches: matchesReducer,
    sports: sportsReducer,
    streams: streamsReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;