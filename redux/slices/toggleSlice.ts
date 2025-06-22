import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ToggleState {
  currency: boolean; // true for NGN, false for USD
  theme: "light" | "dark";
  notifications: boolean;
}

const initialState: ToggleState = {
  currency: true, // Default to NGN
  theme: "light",
  notifications: true,
};

export const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    toggleCurrency: (state) => {
      state.currency = !state.currency;
    },
    setCurrency: (state, action: PayloadAction<boolean>) => {
      state.currency = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
  },
});

export const {
  toggleCurrency,
  setCurrency,
  toggleTheme,
  setTheme,
  toggleNotifications,
  setNotifications,
} = toggleSlice.actions;

export default toggleSlice.reducer;
