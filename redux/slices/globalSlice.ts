import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FlightOffer } from "../../types/flight-types";

interface GlobalState {
  selectedFlight: FlightOffer | null;
  cartItems: any[];
  searchHistory: any[];
  favoriteFlights: FlightOffer[];
}

const initialState: GlobalState = {
  selectedFlight: null,
  cartItems: [],
  searchHistory: [],
  favoriteFlights: [],
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setSelectedFlight: (state, action: PayloadAction<FlightOffer | null>) => {
      state.selectedFlight = action.payload;
    },
    addToCart: (state, action: PayloadAction<any>) => {
      state.cartItems.push(action.payload);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
    addToSearchHistory: (state, action: PayloadAction<any>) => {
      // Add to beginning of array and limit to 10 items
      state.searchHistory.unshift(action.payload);
      if (state.searchHistory.length > 10) {
        state.searchHistory = state.searchHistory.slice(0, 10);
      }
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    addToFavorites: (state, action: PayloadAction<FlightOffer>) => {
      const exists = state.favoriteFlights.find(
        (flight) => flight.id === action.payload.id
      );
      if (!exists) {
        state.favoriteFlights.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favoriteFlights = state.favoriteFlights.filter(
        (flight) => flight.id !== action.payload
      );
    },
  },
});

export const {
  setSelectedFlight,
  addToCart,
  removeFromCart,
  clearCart,
  addToSearchHistory,
  clearSearchHistory,
  addToFavorites,
  removeFromFavorites,
} = globalSlice.actions;

export default globalSlice.reducer;
