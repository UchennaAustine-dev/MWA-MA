import { addExistingAddonsToFlightOffer, getAddons } from "@/lib/flightAPIs";
import type { TravelAddon } from "@/types/travelAddons";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useTravelAddons = (flightOfferId?: string) => {
  const [addons, setAddons] = useState<TravelAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addingAddon, setAddingAddon] = useState<string | null>(null);

  const mapToTravelAddon = (addon: any): TravelAddon => ({
    id: addon.id || "",
    title: addon.name || "",
    description: addon.description || "",
    price: addon.price || 0,
    currency: addon.currency || "USD",
    icon: undefined, // Assign icon in UI if needed
  });

  const fetchTravelAddons = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAddons();
      const formattedAddons: TravelAddon[] =
        response?.addons?.map(mapToTravelAddon) || [];
      setAddons(formattedAddons);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load travel addons"
      );
      console.error("Error fetching travel addons:", err);

      // Fallback mock data
      const mockData: TravelAddon[] = [
        {
          id: "b7b584d7-907f-43e1-9970-aec5cabe9d03",
          title: "WhatsApp Call",
          description: "Reminders at time intervals",
          price: 30,
          currency: "USD",
          icon: undefined,
        },
        {
          id: "travel-data-addon-001",
          title: "Travel Data - Instant Global Connectivity!",
          description:
            "Stay connected in 250+ destinations without swapping SIM cards. Activate instantly and enjoy 1GB of seamless, affordable data wherever you go! Powered by Univesa for reliable global access.",
          price: 11500,
          currency: "NGN",
          icon: undefined,
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
      setSelectedAddons((prev) => prev.filter((id) => id !== addonId));
    } else {
      if (flightOfferId) {
        try {
          setAddingAddon(addonId);
          await addExistingAddonsToFlightOffer(flightOfferId, [addonId]);
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
        setSelectedAddons((prev) => [...prev, addonId]);
      }
    }
  };

  const getSelectedAddonsTotal = () => {
    return addons
      .filter((addon) => selectedAddons.includes(addon.id))
      .reduce((total, addon) => total + addon.price, 0);
  };

  const getSelectedAddonsDetails = () => {
    return addons.filter((addon) => selectedAddons.includes(addon.id));
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
