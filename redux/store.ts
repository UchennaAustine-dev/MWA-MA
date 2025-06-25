import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import flightReducer from "./slices/flightSlice";
import globalReducer from "./slices/globalSlice";
import settingsReducer from "./slices/settingsSlice";
import toggleReducer from "./slices/toggleSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    global: globalReducer,
    toggle: toggleReducer,
    user: userReducer,
    flight: flightReducer,
    cart: cartReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
