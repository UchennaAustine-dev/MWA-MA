import { addExistingAddonsToFlightOffer, getAddons } from "@/lib/flightAPIs";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

interface TravelAddon {
  id?: string;
  bookingId?: string | null;
  name: string;
  description: string;
  price: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useTravelAddons = (flightOfferId?: string) => {
  const [addons, setAddons] = useState<TravelAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addingAddon, setAddingAddon] = useState<string | null>(null);

  const fetchTravelAddons = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAddons();
      setAddons(response?.addons || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load travel addons"
      );
      console.error("Error fetching travel addons:", err);

      // Fallback to mock data for development
      const mockData: TravelAddon[] = [
        {
          id: "b7b584d7-907f-43e1-9970-aec5cabe9d03",
          bookingId: null,
          name: "WhatsApp Call",
          description: "Reminders at time intervals",
          price: 30,
          currency: "USD",
          createdAt: "2025-06-07T14:44:11.581Z",
          updatedAt: "2025-06-07T14:44:11.581Z",
        },
        {
          id: "travel-data-addon-001",
          bookingId: null,
          name: "Travel Data - Instant Global Connectivity!",
          description:
            "Stay connected in 250+ destinations without swapping SIM cards. Activate instantly and enjoy 1GB of seamless, affordable data wherever you go! Powered by Univesa for reliable global access.",
          price: 11500,
          currency: "NGN",
          createdAt: "2025-06-07T14:44:11.581Z",
          updatedAt: "2025-06-07T14:44:11.581Z",
        },
      ];
      setAddons(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelAddons();
  }, []);

  const toggleAddon = async (addonId: string) => {
    const isCurrentlySelected = selectedAddons.includes(addonId);

    if (isCurrentlySelected) {
      // Remove addon locally
      setSelectedAddons((prev) => prev.filter((id) => id !== addonId));
    } else {
      // Add addon - call API if flightOfferId is available
      if (flightOfferId) {
        try {
          setAddingAddon(addonId);

          // Call API to link addon to flight offer
          await addExistingAddonsToFlightOffer(flightOfferId, [addonId]);

          // Add to local state on success
          setSelectedAddons((prev) => [...prev, addonId]);
        } catch (error) {
          console.error("Failed to add addon to flight offer:", error);
          Alert.alert(
            "Error",
            `Failed to add addon: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        } finally {
          setAddingAddon(null);
        }
      } else {
        // If no flightOfferId, just add to local state
        setSelectedAddons((prev) => [...prev, addonId]);
      }
    }
  };

  const getSelectedAddonsTotal = () => {
    return addons
      .filter((addon) => selectedAddons.includes(addon.id || ""))
      .reduce((total, addon) => total + addon.price, 0);
  };

  const getSelectedAddonsDetails = () => {
    return addons.filter((addon) => selectedAddons.includes(addon.id || ""));
  };

  return {
    addons,
    loading,
    error,
    selectedAddons,
    addingAddon,
    toggleAddon,
    getSelectedAddonsTotal,
    getSelectedAddonsDetails,
    refetch: fetchTravelAddons,
  };
};
