"use client";

import { useEffect, useState } from "react";

interface Country {
  name: string;
  iso2: string;
  iso3: string;
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [countryError, setCountryError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/iso",
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data?.data) {
          setCountries(
            data.data.map((c: any) => ({
              name: c.name,
              iso2: c.Iso2, // Note: API returns 'Iso2' not 'iso2'
              iso3: c.Iso3,
            }))
          );
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setCountryError("Failed to fetch countries. Please try again later.");
          console.error("Failed to fetch countries:", err);
        }
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
    return () => controller.abort();
  }, []);

  return { countries, loadingCountries, countryError };
};
