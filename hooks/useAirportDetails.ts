import { fetchAirportDetails, type AirportDetails } from "@/lib/flightAPIs";
import { useEffect, useState } from "react";

export function useAirportDetails(iataCode: string) {
  const [airportDetails, setAirportDetails] = useState<AirportDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iataCode || iataCode.length !== 3) {
      setAirportDetails(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchAirportDetails(iataCode);
        setAirportDetails(details);
      } catch (err: any) {
        console.warn(`Airport details failed for ${iataCode}:`, err.message);
        setError("Details unavailable");
        setAirportDetails(null);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to avoid too many rapid requests
    const timeoutId = setTimeout(fetchDetails, 100);
    return () => clearTimeout(timeoutId);
  }, [iataCode]);

  return { airportDetails, loading, error };
}
