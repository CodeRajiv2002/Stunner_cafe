import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

let socketInstance = null;

export const getSocket = () => {
  // If the socket doesn't exist, create it
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      // Helps avoid CORS or connection issues in some environments
      transports: ["websocket"],
    });

    // Global listeners (only attached once)
    socketInstance.on("connect", () => {
      console.log("✅ Socket Connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket Disconnected:", reason);
    });
  }

  return socketInstance;
};

// Export the initialized instance for immediate use
export const socket = getSocket();
