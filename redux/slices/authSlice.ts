import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hasSeenIntro: boolean;
  newUserId: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  hasSeenIntro: false,
  newUserId: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setHasSeenIntro: (state, action: PayloadAction<boolean>) => {
      state.hasSeenIntro = action.payload;
    },
    setNewUserId: (state, action: PayloadAction<string | null>) => {
      state.newUserId = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.newUserId = null;
      // Keep hasSeenIntro as true so user doesn't see intro again
    },
  },
});

export const { setUser, setToken, setHasSeenIntro, setNewUserId, logout } =
  authSlice.actions;
export default authSlice.reducer;
