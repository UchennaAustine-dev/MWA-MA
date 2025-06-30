export interface HotelBookingData {
  hotel: {
    hotelId: string;
    hotelName: string;
    hotelRating: number;
    address: {
      cityCode: string;
      cityName?: string;
      countryCode: string;
      fullAddress: string;
    };
    images: string[];
    amenities: string[];
    description: string;
    distance: string;
  };
  offer: {
    id: string;
    checkInDate: string;
    checkOutDate: string;
    room: {
      type: string;
      typeEstimated?: {
        category: string;
        beds: number;
        bedType: string;
      };
      description: string;
    };
    guests: {
      adults: number;
    };
    price: {
      currency: string;
      base: string;
      total: string;
    };
    policies: {
      paymentType: string;
    };
  };
  searchParams: {
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    infants: number;
    rooms: number;
    cityCode: string;
    cityName: string;
  };
}

export interface BookingFormData {
  guests: Array<{
    tid: number;
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }>;
  travelAgent: {
    contact: {
      email: string;
    };
  };
  roomAssociations: Array<{
    guestReferences: Array<{
      guestReference: string;
    }>;
    hotelOfferId: string;
  }>;
  payment: {
    method: string;
    paymentCard: {
      paymentCardInfo: {
        vendorCode: string;
        cardNumber: string;
        expiryDate: string;
        holderName: string;
      };
    };
  };
}
