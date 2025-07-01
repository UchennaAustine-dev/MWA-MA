import axios from "axios";

// const BASE_URL = "https://manwhit.lemonwares.com.ng/api";
const BASE_URL = "https://api.manwhitaroes.com";

export async function getGuestUserById(id: string) {
  try {
    const response = await axios.post(`${BASE_URL}/account/guest-user/${id}`);
    return response?.data;
  } catch (error: any) {
    console.error("Error getting guest user:", error);
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get guest user information"
    );
  }
}

// export const updateUserInfo = async (userId: string, data: any) => {
//   try {
//     const response = await axios.patch(
//       `${BASE_URL}/account/${userId}/update-details`,
//       data
//     );
//     return response?.data?.data || response.data;
//   } catch (error: any) {
//     throw new Error(
//       error?.response?.data?.message ||
//         error?.message ||
//         "Failed to update user information"
//     );
//   }
// };

export async function createTraveler(data: any) {
  try {
    const response = await axios.post(`${BASE_URL}/account/traveler`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to create traveler"
    );
  }
}

export async function getTravelerById(id: string) {
  try {
    const response = await axios.get(
      `${BASE_URL}/account/traveler/${id}/amadeus`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get traveler"
    );
  }
}

export async function storeSelectedOffer(offerData: any) {
  try {
    const response = await axios.post(
      `${BASE_URL}/flight/save-flight-offer`,
      offerData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to store flight offer"
    );
  }
}

export async function createGuestUser(data: any) {
  try {
    const response = await axios.post(`${BASE_URL}/account/guest-user`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to create guest user"
    );
  }
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

/**
 * Update user information - converted from web version
 * @param userId - User ID
 * @param data - User data to update
 * @returns Updated user data
 */
export const updateUserInfo = async (userId: string, data: any) => {
  try {
    const response: any = await axios.patch(
      `${BASE_URL}/account/${userId}/update-details`,
      data
    );

    // Check if response has data property and return appropriate structure
    return response?.data?.data || response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update user information"
    );
  }
};

/**
 * Delete flight booking - converted from web version
 * @param flightBookingId - Booking ID to delete
 * @returns Response data
 */
export const deleteFlightBooking = async (flightBookingId: string) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/booking/delete-booking/${flightBookingId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        error?.response ||
        error ||
        "Action failed"
    );
  }
};

/**
 * Fetch single user data with SWR-like functionality for React Native
 * @param userId - User ID
 * @returns User data with bookings
 */
export const fetchUserData = async (userId: string) => {
  try {
    const response: any = await axios.get(
      `${BASE_URL}/account/${userId}/get-details`
    );
    return response?.data.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Action failed"
    );
  }
};
