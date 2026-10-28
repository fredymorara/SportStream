import { configureStore } from "@reduxjs/toolkit";
import matchesReducer from "./matchesSlice";
import sportsReducer from "./sportsSlice";

export const store = configureStore({
  reducer: {
    matches: matchesReducer,
    sports: sportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
