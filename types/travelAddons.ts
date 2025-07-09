import type React from "react";

export interface TravelAddon {
  id: string;
  icon?: React.ReactNode; // optional, can be added later
  title: string;
  description: string;
  price: number;
  currency: string;
}
