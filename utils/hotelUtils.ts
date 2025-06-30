export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatPrice = (price: string | number, currency = "USD") => {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numPrice);
};

export const getLowestPrice = (hotel: any) => {
  if (!hotel.offers || hotel.offers.length === 0) return 0;
  return Math.min(
    ...hotel.offers.map((offer: any) => Number.parseFloat(offer.price.total))
  );
};

export const getCurrency = (hotel: any) => {
  return hotel.offers?.[0]?.price?.currency || "USD";
};

export const getTotalGuests = (searchParams: any) => {
  return searchParams.adults + searchParams.children + searchParams.infants;
};
