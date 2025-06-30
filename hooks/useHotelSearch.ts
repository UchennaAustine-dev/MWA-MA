import { HotelBookingData } from "@/types/booking";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { baseURL } from "../lib/api";

export const useHotelSearch = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchHotels = useCallback(
    async (searchParams: any, selectedCity: any) => {
      if (!selectedCity) {
        Alert.alert("Error", "Please select a city");
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const searchData = {
          cityCode: selectedCity.code || selectedCity.iataCode,
          checkInDate: searchParams.checkInDate.toISOString().split("T")[0],
          checkOutDate: searchParams.checkOutDate.toISOString().split("T")[0],
          adults: searchParams.adults || 1,
          children: searchParams.children || 0,
          rooms: searchParams.rooms || 1,
        };

        const response = await fetch(
          `${baseURL}/hotel/hotels-with-offers?${new URLSearchParams(
            searchData
          )}`
        );
        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          const processedHotels = data.data.map((hotel: any) => ({
            ...hotel,
            images: [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
              "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400",
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
            ],
            description: `Experience luxury and comfort at ${hotel.hotelName}. Our premium hotel offers world-class amenities and exceptional service.`,
            distance: `${(Math.random() * 5 + 0.5).toFixed(
              1
            )} km from city center`,
          }));

          setHotels(processedHotels);
          Alert.alert("Success", `Found ${processedHotels.length} hotels`);
        } else {
          setHotels([]);
          Alert.alert("No Results", "No hotels found for your search criteria");
        }
      } catch (error: any) {
        console.error("Hotel search error:", error);
        Alert.alert("Error", "Failed to search hotels. Please try again.");
        setHotels([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const createBookingData = useCallback(
    (
      hotel: any,
      searchParams: any,
      selectedCity: any,
      selectedOffer?: any
    ): HotelBookingData => {
      return {
        hotel: {
          hotelId: hotel.hotelId,
          hotelName: hotel.hotelName,
          hotelRating: hotel.hotelRating || 4,
          address: {
            cityCode: hotel.address.cityCode,
            cityName: hotel.address.cityName,
            countryCode: hotel.address.countryCode,
            fullAddress:
              hotel.address.lines?.join(", ") ||
              `${hotel.address.cityName || hotel.address.cityCode}, ${
                hotel.address.countryCode
              }`,
          },
          images: hotel.images || [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
          ],
          amenities: hotel.amenities || [
            "Free WiFi",
            "Parking",
            "Fitness Center",
            "Restaurant",
          ],
          description:
            hotel.description ||
            `Experience luxury and comfort at ${hotel.hotelName}. Our premium hotel offers world-class amenities and exceptional service.`,
          distance: hotel.distance || "1.2 km from city center",
        },
        offer: selectedOffer || hotel.offers[0],
        searchParams: {
          checkInDate: searchParams.checkInDate.toISOString().split("T")[0],
          checkOutDate: searchParams.checkOutDate.toISOString().split("T")[0],
          adults: searchParams.adults,
          children: searchParams.children,
          infants: searchParams.infants,
          rooms: searchParams.rooms,
          cityCode: selectedCity?.code || selectedCity?.iataCode || "",
          cityName: selectedCity?.name || "",
        },
      };
    },
    []
  );

  const saveBookingData = useCallback(async (bookingData: HotelBookingData) => {
    await AsyncStorage.setItem("hotelBookingData", JSON.stringify(bookingData));
  }, []);

  return {
    hotels,
    isSearching,
    hasSearched,
    searchHotels,
    createBookingData,
    saveBookingData,
  };
};
