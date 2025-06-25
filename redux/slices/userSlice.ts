import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
}

interface UserState {
  user: User | null;
  guestUser: Record<string, any> | null;
  hasSeenIntro: boolean;
  newUserId: string | null;
}

const initialState: UserState = {
  user: null,
  guestUser: null,
  hasSeenIntro: false,
  newUserId: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    mainUser: (state, action: PayloadAction<Record<string, any>>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setGuestUser: (state, action: PayloadAction<Record<string, any>>) => {
      state.guestUser = action.payload;
    },
    clearGuestUser: (state) => {
      state.guestUser = null;
    },
    setHasSeenIntro: (state, action: PayloadAction<boolean>) => {
      state.hasSeenIntro = action.payload;
    },
    setNewUserId: (state, action: PayloadAction<string | null>) => {
      state.newUserId = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.guestUser = null;
      state.newUserId = null;
      // Keep hasSeenIntro as true so user doesn't see intro again
    },
  },
});

export const {
  setUser,
  mainUser,
  clearUser,
  setGuestUser,
  clearGuestUser,
  setHasSeenIntro,
  setNewUserId,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
