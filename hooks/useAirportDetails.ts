import { fetchAirportDetails, type AirportDetails } from "@/lib/flightAPIs";
import { useEffect, useState } from "react";

export function useAirportDetails(iataCode: string) {
  const [airportDetails, setAirportDetails] = useState<AirportDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iataCode) {
      setAirportDetails(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchAirportDetails(iataCode);
        setAirportDetails(details);
      } catch (err: any) {
        setError(err.message || "Failed to fetch airport details");
        setAirportDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [iataCode]);

  return { airportDetails, loading, error };
}
