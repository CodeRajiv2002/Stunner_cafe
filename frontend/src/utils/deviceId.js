import axios from "axios";

export const getDeviceId = () => {
  // 1. Check if ID already exists in storage
  let deviceId = localStorage.getItem("stunner_device_id");

  // 2. If not, generate a new one and save it
  if (!deviceId) {
    deviceId = crypto.randomUUID(); // Generates string like "36b8f84d-df4e-4d49..."
    localStorage.setItem("stunner_device_id", deviceId);
  }

  return deviceId;
};

export const getNewOrders = async (status) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/orders/today?status=${status}`,
    );
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch orders");
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error("Error fetching new orders:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(
      import.meta.env.VITE_API_URL + `/orders/update/${orderId}`,
      {
        status,
      },
    );
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to update status");
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error("Error updating order status:", errorMsg);
    throw new Error(errorMsg);
  }
};
