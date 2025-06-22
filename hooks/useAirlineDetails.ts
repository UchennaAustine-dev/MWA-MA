import { fetchAirlineDetails, type AirlineDetails } from "@/lib/flightAPIs";
import { useEffect, useState } from "react";

export function useAirlineDetails(iataCode: string) {
  const [airlineDetails, setAirlineDetails] = useState<AirlineDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iataCode) {
      setAirlineDetails(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchAirlineDetails(iataCode);
        setAirlineDetails(details);
      } catch (err: any) {
        setError(err.message || "Failed to fetch airline details");
        setAirlineDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [iataCode]);

  return { airlineDetails, loading, error };
}
