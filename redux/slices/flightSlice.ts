import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FlightOffer } from "../../types/flight-types";

interface FlightState {
  selectedFlight: Record<string, any> | null;
  flightOffrId: string | null;
  traveler: Record<string, any>[] | null;
  searchHistory: any[];
  favoriteFlights: FlightOffer[];
}

const initialState: FlightState = {
  selectedFlight: null,
  flightOffrId: null,
  traveler: [],
  searchHistory: [],
  favoriteFlights: [],
};

export const flightSlice = createSlice({
  name: "flight",
  initialState,
  reducers: {
    setSelectedFlight: (
      state,
      action: PayloadAction<Record<string, any> | null>
    ) => {
      state.selectedFlight = action.payload;
    },
    setFlightOffrId: (state, action: PayloadAction<string | null>) => {
      state.flightOffrId = action.payload;
    },
    clearSelectedFlight: (state) => {
      state.selectedFlight = null;
    },
    setTraveler: (
      state,
      action: PayloadAction<Record<string, any>[] | Record<string, any>>
    ) => {
      // Handle both array and single object
      if (Array.isArray(action.payload)) {
        state.traveler = action.payload;
      } else {
        state.traveler = [action.payload];
      }
    },
    addTraveler: (state, action: PayloadAction<Record<string, any>>) => {
      if (!state.traveler) {
        state.traveler = [];
      }
      state.traveler.push(action.payload);
    },
    clearTravelers: (state) => {
      state.traveler = [];
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
  setFlightOffrId,
  clearSelectedFlight,
  setTraveler,
  addTraveler,
  clearTravelers,
  addToSearchHistory,
  clearSearchHistory,
  addToFavorites,
  removeFromFavorites,
} = flightSlice.actions;

export default flightSlice.reducer;
