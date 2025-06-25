import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  currency: string;
  toggle: boolean;
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
}

const initialState: SettingsState = {
  currency: "USD",
  toggle: false,
  theme: "light",
  notifications: true,
  language: "en",
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    chooseNGN: (state) => {
      state.currency = "NGN";
    },
    chooseUSD: (state) => {
      state.currency = "USD";
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    openToggle: (state) => {
      state.toggle = true;
    },
    closeToggle: (state) => {
      state.toggle = false;
    },
    setToggle: (state, action: PayloadAction<boolean>) => {
      state.toggle = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const {
  chooseNGN,
  chooseUSD,
  setCurrency,
  openToggle,
  closeToggle,
  setToggle,
  setTheme,
  toggleTheme,
  setNotifications,
  toggleNotifications,
  setLanguage,
} = settingsSlice.actions;

export default settingsSlice.reducer;
