import axios from "axios";
import type { FlightOffer, FlightSearchParams } from "../types/flight-types";

const BASE_URL = "https://manwhit.lemonwares.com.ng/api";

export const searchFlights = async (
  params: FlightSearchParams
): Promise<FlightOffer[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/flight/search`, {
      params: {
        origin: params.origin,
        destination: params.destination,
        adults: params.adults,
        departureDate: params.departureDate,
        currency: params.currency,
        ...(params.returnDate && { returnDate: params.returnDate }),
      },
    });

    return response.data?.data || response.data || [];
  } catch (error: any) {
    console.error("Flight search API error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to search flights"
    );
  }
};

export const fetchFlightPricing = async (
  flightOffer: FlightOffer
): Promise<any[]> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/flight/search-flight-price`,
      {
        flightOffer,
      }
    );

    return response.data?.data || response.data || [];
  } catch (error: any) {
    console.error("Flight pricing API error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch flight pricing"
    );
  }
};

export const addFlightToCart = async (
  userId: string,
  flightData: any
): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/booking/cart/${userId}`, {
      flightData,
    });
  } catch (error: any) {
    console.error("Add to cart API error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to add flight to cart"
    );
  }
};

export const getUserCart = async (userId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/booking/cart/${userId}`);
    console.log(`Cart Response`, response);

    return response.data?.data || [];
  } catch (error: any) {
    console.error("Get cart API error:", error);
    throw new Error(error.response?.data?.message || "Failed to get user cart");
  }
};

export const removeFlightFromCart = async (cartId: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/booking/cart/item/${cartId}`);
  } catch (error: any) {
    console.error("Remove from cart API error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to remove flight from cart"
    );
  }
};

export const emptyUserFlightCart = async (userId: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/booking/cart/${userId}/empty`);
  } catch (error: any) {
    console.error("Empty cart API error:", error);
    throw new Error(error.response?.data?.message || "Failed to empty cart");
  }
};

// Airport Details API
export interface AirportDetails {
  iataCode: string;
  name: string;
  detailedName?: string;
  city?: string;
  cityCode?: string;
  country?: string;
  countryCode?: string;
  regionCode?: string;
  timeZone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  analytics?: any;
  type?: string;
  subType?: string;
  id?: string;
  selfLink?: string;
}

export async function fetchAirportDetails(
  iataCode: string
): Promise<AirportDetails | any> {
  if (!iataCode) {
    throw new Error("IATA code is required");
  }

  try {
    const response = await axios.get(`${BASE_URL}/flight/airport-details`, {
      params: { iataCode },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching airport details:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Airline Details API
export interface AirlineDetails {
  iataCode: string;
  type?: string;
  icaoCode?: string;
  businessName?: string;
  commonName?: string;
}

export async function fetchAirlineDetails(
  iataCode: string
): Promise<AirlineDetails | any> {
  if (!iataCode) {
    throw new Error("IATA code is required");
  }

  try {
    const response = await axios.get(`${BASE_URL}/flight/airline-details`, {
      params: { iataCode },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching airline details:",
      error.response?.data || error.message
    );
    throw error;
  }
}
