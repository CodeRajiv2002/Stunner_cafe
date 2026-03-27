import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_API_URL;

let socketInstance = null;

export const getSocket = () => {
  // If the socket doesn't exist, create it
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
      credentials: true,
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
console.log(socket);
