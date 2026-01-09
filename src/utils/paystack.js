const axios = require("axios");

const paystackAPI = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// Initialize payment
const initializePayment = async (email, amount, reference, metadata = {}) => {
  try {
    const response = await paystackAPI.post("/transaction/initialize", {
      email,
      amount: amount * 100, // Paystack uses kobo (smallest currency unit)
      reference,
      metadata,
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Payment initialization failed"
    );
  }
};

// Verify payment
const verifyPayment = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Payment verification failed"
    );
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
};
