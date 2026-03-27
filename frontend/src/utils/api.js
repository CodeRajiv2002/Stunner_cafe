import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const fetchTables = async () => {
  try {
    const res = await axios.get(`${API_BASE}/tables`);
    if (res.data.success) {
      return res.data.data.tables;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch tables", error);
    return [];
  }
};

export const fetchActiveChats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/messages/active`);
    if (res.data.success) {
      return res.data.data; // Returns object: { "1": [...msgs], "2": [...msgs] }
    }
    return {};
  } catch (error) {
    console.error("Failed to fetch chats", error);
    return {};
  }
};

export const clearChatHistory = async (tableNumber) => {
  try {
    const res = await axios.delete(`${API_BASE}/messages/${tableNumber}`);
    return res.data;
  } catch (error) {
    console.error("Failed to clear chat", error);
    throw error;
  }
};

export const toggleTableStatus = async (tableNumber, status) => {
  try {
    const res = await axios.put(`${API_BASE}/tables/${tableNumber}`, {
      status,
    });
    if (res.data.success) {
      return res.data;
    }
    throw new Error(res.data.message);
  } catch (error) {
    console.error(
      "Failed to toggle table status",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

export const fetchOrderHistory = async ({ timeRange, status }) => {
  try {
    const params = { timeRange };
    if (status) params.status = status;
    const res = await axios.get(`${API_BASE}/orders/history`, { params });
    if (res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data.message);
  } catch (error) {
    console.error(
      "Failed to fetch order history",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

// Example API call from your Admin Panel
export const markAsPaid = async (orderId, paymentStatus) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/orders/${orderId}/payment`,
      {
        paymentStatus,
      },
    );
    if (response.data.success) {
      console.log("Payment successful:", response.data.message);
      return response.data;
    }
    throw new Error(response.data.message);
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error("Payment error:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const resetTable = async (tableNumber) => {
  try {
    const res = await axios.delete(`${API_BASE}/tables/${tableNumber}/reset`);
    if (res.data.success) {
      console.log("Table reset:", res.data.message);
      return res.data;
    }
    throw new Error(res.data.message);
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error("Failed to reset table:", errorMsg);
    throw new Error(errorMsg);
  }
};
