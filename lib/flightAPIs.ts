import axios from "axios";
import type { FlightOffer, FlightSearchParams } from "../types/flight-types";

// const BASE_URL = "https://manwhit.lemonwares.com.ng/api";
const BASE_URL = "https://api.manwhitaroes.com";
// const BASE_URL = "http://192.168.1.100:8000";

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
  timezone?: string;
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

// Airline Details API
export interface AirlineDetails {
  iataCode: string;
  icaoCode?: string;
  type?: string;
  businessName?: string;
  commonName?: string;
  country?: string;
}

// Mock data for fallback
const mockAirportData: { [key: string]: AirportDetails } = {
  LAG: {
    iataCode: "LAG",
    name: "Murtala Muhammed International Airport",
    city: "Lagos",
    country: "Nigeria",
    timezone: "Africa/Lagos",
  },
  ABV: {
    iataCode: "ABV",
    name: "Nnamdi Azikiwe International Airport",
    city: "Abuja",
    country: "Nigeria",
    timezone: "Africa/Lagos",
  },
  LHR: {
    iataCode: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
  },
  JFK: {
    iataCode: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    timezone: "America/New_York",
  },
  DXB: {
    iataCode: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    timezone: "Asia/Dubai",
  },
};

const mockAirlineData: { [key: string]: AirlineDetails } = {
  AA: {
    iataCode: "AA",
    icaoCode: "AAL",
    commonName: "American Airlines",
    businessName: "American Airlines Inc.",
    country: "United States",
  },
  BA: {
    iataCode: "BA",
    icaoCode: "BAW",
    commonName: "British Airways",
    businessName: "British Airways Plc",
    country: "United Kingdom",
  },
  EK: {
    iataCode: "EK",
    icaoCode: "UAE",
    commonName: "Emirates",
    businessName: "Emirates Airline",
    country: "United Arab Emirates",
  },
  LH: {
    iataCode: "LH",
    icaoCode: "DLH",
    commonName: "Lufthansa",
    businessName: "Deutsche Lufthansa AG",
    country: "Germany",
  },
  AF: {
    iataCode: "AF",
    icaoCode: "AFR",
    commonName: "Air France",
    businessName: "Air France",
    country: "France",
  },
};

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
    const response = await axios.post(
      `${BASE_URL}/booking/add-to-cart/${userId}`,
      {
        flightData,
      }
    );
    return response.data.data.flightData;
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
    console.log(`Cart Response`, response.data.data);

    return response.data?.data || [];
  } catch (error: any) {
    console.error("Get cart API error:", error);
    throw new Error(error.response?.data?.message || "Failed to get user cart");
  }
};

export const removeFlightFromCart = async (cartId: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/booking/remove-from-cart/${cartId}`);
  } catch (error: any) {
    console.error("Remove from cart API error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to remove flight from cart"
    );
  }
};

export const emptyUserFlightCart = async (userId: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/booking/delete-cart/${userId}`);
  } catch (error: any) {
    console.error("Empty cart API error:", error);
    throw new Error(error.response?.data?.message || "Failed to empty cart");
  }
};

// export async function fetchAirportDetails(
//   iataCode: string
// ): Promise<AirportDetails | any> {
//   if (!iataCode) {
//     throw new Error("IATA code is required");
//   }

//   try {
//     const response = await axios.get(`${BASE_URL}/flight/airport-details`, {
//       params: { iataCode },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error(
//       "Error fetching airport details:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// }

// export async function fetchAirlineDetails(
//   iataCode: string
// ): Promise<AirlineDetails | any> {
//   if (!iataCode) {
//     throw new Error("IATA code is required");
//   }

//   try {
//     const response = await axios.get(`${BASE_URL}/flight/airline-details`, {
//       params: { iataCode },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error(
//       "Error fetching airline details:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// }

// Fetch airport details with fallback
export const fetchAirportDetails = async (
  iataCode: string
): Promise<AirportDetails> => {
  if (!iataCode) {
    throw new Error("IATA code is required");
  }

  // Check mock data first
  if (mockAirportData[iataCode.toUpperCase()]) {
    return mockAirportData[iataCode.toUpperCase()];
  }

  try {
    const response = await axios.get(`${BASE_URL}/flight/airport-details`, {
      params: { iataCode },
      timeout: 5000, // Shorter timeout for details
    });
    return response.data;
  } catch (error: any) {
    console.warn(`Airport details not found for ${iataCode}, using fallback`);

    // Return basic fallback data
    return {
      iataCode: iataCode.toUpperCase(),
      name: `${iataCode.toUpperCase()} Airport`,
      city: "Unknown",
      country: "Unknown",
    };
  }
};

// Fetch airline details with fallback
export const fetchAirlineDetails = async (
  iataCode: string
): Promise<AirlineDetails> => {
  if (!iataCode) {
    throw new Error("IATA code is required");
  }

  // Check mock data first
  if (mockAirlineData[iataCode.toUpperCase()]) {
    return mockAirlineData[iataCode.toUpperCase()];
  }

  try {
    const response = await axios.get(`${BASE_URL}/flight/airline-details`, {
      params: { iataCode },
      timeout: 5000, // Shorter timeout for details
    });
    return response.data;
  } catch (error: any) {
    console.warn(`Airline details not found for ${iataCode}, using fallback`);

    // Return basic fallback data
    return {
      iataCode: iataCode.toUpperCase(),
      commonName: `${iataCode.toUpperCase()} Airlines`,
    };
  }
};

// Travel Addons API
export async function getAddons() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/get-addons`);
    return response.data || response.data.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Get addons failed:", error.response.data);
      throw new Error(error.response.data.message || "Failed to get addons");
    } else {
      console.error("Get addons error:", error.message);
      throw error;
    }
  }
}

export const addExistingAddonsToFlightOffer = async (
  flightOfferId: string,
  addonIds: string[]
) => {
  if (!flightOfferId) throw new Error("Flight offer ID is required");
  if (!Array.isArray(addonIds) || addonIds.length === 0)
    throw new Error("addonIds array is required");

  const payload = { addonIds };

  try {
    const response = await axios.patch(
      `${BASE_URL}/admin/add-addons-to-flight-offers/${flightOfferId}`,
      payload
    );
    return response.data; // { message: string }
  } catch (error: any) {
    console.error("Error linking addons to flight offer:", error);
    throw error.response?.data || error.message;
  }
};

// Flight Offer Management
export async function fetchFlightOfferById(flightOfferId: string) {
  try {
    const response = await axios.get(
      `${BASE_URL}/flight/get-flight-offer/${flightOfferId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching flight offer:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch flight offer"
    );
  }
}

export async function getTravelerById(travelerId: string) {
  try {
    const response = await axios.get(
      `${BASE_URL}/account/traveler/${travelerId}/amadeus`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching traveler:", error);
    throw new Error(error.response?.data?.message || "Failed to get traveler");
  }
}

export async function storeSelectedOffer(offerData: any) {
  try {
    const response = await axios.post(
      `${BASE_URL}/flight/save-flight-offer`,
      offerData
    );
    return response.data;
  } catch (error: any) {
    console.error("Error storing flight offer:", error);
    throw new Error(
      error.response?.data?.message || "Failed to store flight offer"
    );
  }
}

export async function bookFlightWithAddons(data: any) {
  try {
    const response: any = await axios.post(
      `${BASE_URL}/flight/book-flight`,
      data
    );

    console.log("[bookFlightWithAddons] Response data:", response.data);

    // Return the nested data if exists, otherwise the whole response data
    return response.data?.data || response.data;
  } catch (error: any) {
    if (error.response) {
      // Log detailed error info for debugging
      console.error(
        "[bookFlightWithAddons] Booking failed with status:",
        error.response.status
      );
      console.error(
        "[bookFlightWithAddons] Error response data:",
        error.response.data
      );

      // Throw a new Error with message from server or fallback message
      throw new Error(error.response.data?.message || "Booking failed");
    } else {
      console.error("[bookFlightWithAddons] Booking error:", error.message);
      throw error;
    }
  }
}
