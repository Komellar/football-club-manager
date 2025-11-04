"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/auth-slice";
import matchEventsReducer from "@/features/match-events/store/match-events-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      matchEvents: matchEventsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for async thunks
      }),
    devTools: process.env.NODE_ENV !== "production",
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
