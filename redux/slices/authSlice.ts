import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  hasSeenIntro: false,
  newUserId: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setHasSeenIntro: (state, action) => {
      state.hasSeenIntro = action.payload;
    },
    setNewUserId: (state, action) => {
      state.newUserId = action.payload;
    },
  },
});

export const { setUser, setToken, setHasSeenIntro, setNewUserId } =
  authSlice.actions;
export default authSlice.reducer;
