import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import globalReducer from "./slices/globalSlice";
import toggleReducer from "./slices/toggleSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    global: globalReducer,
    toggle: toggleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
