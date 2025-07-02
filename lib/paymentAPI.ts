import axios from "axios";

// const API_BASE_URL = "https://manwhit.lemonwares.com.ng/api";
const API_BASE_URL = "https://api.manwhitaroes.com";
// const API_BASE_URL = "http://192.168.1.100:8000";

export interface PaymentVerificationResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
}

export const initializePayment = async ({
  amount,
  email,
  bookingData,
  currency,
}: {
  amount: number;
  email: string;
  bookingData: any;
  currency: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment/initialize`, {
      amount,
      email,
      bookingData,
      currency,
    });
    return response.data.data; // { publicKey, reference, amount, currency, paymentLink }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to initialize payment"
    );
  }
};

export const verifyPayment = async (
  tx_ref: string
): Promise<PaymentVerificationResponse> => {
  try {
    // Validate input
    if (!tx_ref || typeof tx_ref !== "string") {
      throw new Error("Invalid transaction reference");
    }

    // Make the POST request
    const response = await axios({
      method: "post",
      url: `${API_BASE_URL}/payment/verify`,
      data: { tx_ref }, // Send tx_ref in the request body
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Validate response structure
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid server response");
    }

    return response.data;
  } catch (error: any) {
    console.error("Payment verification failed:", error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.error || "payment_verification_failed",
        message: error.response.data?.message || "Payment verification failed",
      };
    } else {
      // No response received
      return {
        success: false,
        error: "network_error",
        message: error.message || "Network error occurred",
      };
    }
  }
};
