import { fetchAirlineDetails, type AirlineDetails } from "@/lib/flightAPIs";
import { useEffect, useState } from "react";

export function useAirlineDetails(iataCode: string) {
  const [airlineDetails, setAirlineDetails] = useState<AirlineDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iataCode || iataCode.length !== 2) {
      setAirlineDetails(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchAirlineDetails(iataCode);
        setAirlineDetails(details);
      } catch (err: any) {
        console.warn(`Airline details failed for ${iataCode}:`, err.message);
        setError("Details unavailable");
        setAirlineDetails(null);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to avoid too many rapid requests
    const timeoutId = setTimeout(fetchDetails, 100);
    return () => clearTimeout(timeoutId);
  }, [iataCode]);

  return { airlineDetails, loading, error };
}
