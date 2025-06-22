import axios from "axios";

const BASE_URL = "https://manwhit.lemonwares.com.ng/api";

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

export const updateUserInfo = async (userId: string, data: any) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/account/${userId}/update-details`,
      data
    );
    return response?.data?.data || response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update user information"
    );
  }
};

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
