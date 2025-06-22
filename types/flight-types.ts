export interface City {
  code: string;
  name: string;
  country: string;
  fullName: string;
  iataCode?: string;
  airport?: string;
  countryName?: string;
}

export interface TravelerConfig {
  adults: number;
  children: number;
  infants: number;
  class: string;
}

export type TripType = "oneway" | "roundtrip";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  adults: number;
  departureDate: string;
  currency: string;
  returnDate?: string;
}

export interface FlightOffer {
  id: string;
  price: {
    total: string;
    grandTotal: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      duration: string;
    }>;
  }>;
}
