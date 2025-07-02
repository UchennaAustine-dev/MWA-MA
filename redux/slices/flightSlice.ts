import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FlightOffer } from "../../types/flight-types";

interface SearchHistoryItem {
  from: any;
  to: any;
  departureDate: string;
  returnDate?: string | null;
  travelers: number;
  class: string;
  timestamp: string;
  tripType?: string;
}
interface FlightState {
  selectedFlight: Record<string, any> | null;
  flightOffrId: string | null;
  traveler: Record<string, any>[] | null;
  searchResults: FlightOffer[];
  searchHistory: any[];
  favoriteFlights: FlightOffer[];
  isLoading: boolean;
  error: string | null;
  favorites: FlightOffer[];
}

const initialState: FlightState = {
  selectedFlight: null,
  flightOffrId: null,
  traveler: [],
  searchHistory: [],
  searchResults: [],
  favoriteFlights: [],
  isLoading: false,
  error: null,
  favorites: [],
};

export const flightSlice = createSlice({
  name: "flight",
  initialState,
  reducers: {
    setSelectedFlight: (state, action: PayloadAction<FlightOffer | null>) => {
      state.selectedFlight = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<FlightOffer[]>) => {
      state.searchResults = action.payload;
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
    addToSearchHistory: (
      state,
      action: PayloadAction<SearchHistoryItem | any>
    ) => {
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
      const exists = state.favorites.find(
        (flight) => flight.id === action.payload.id
      );
      if (!exists) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(
        (flight) => flight.id !== action.payload
      );
    },
    clearFavorites: (state) => {
      state.favorites = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
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
  setError,
  setLoading,
  setSearchResults,
  clearFavorites,
  clearSearchResults,
} = flightSlice.actions;

export default flightSlice.reducer;
