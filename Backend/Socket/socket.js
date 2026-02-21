import {
  handleNewOrder,
  handleJoinRoom,
  handleUserMessage,
  handleStaffMessage,
  handleDisconnect,
} from "./socketController.js";

/**
 * Sets up Socket.io event listeners.
 * @param {Server} io - The Socket.io server instance.
 */
export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- ORDER EVENTS ---
    socket.on("new_order", (data) => handleNewOrder(io, socket, data));

    // --- CHAT EVENTS ---
    socket.on("join_room", (roomName) => handleJoinRoom(socket, roomName));

    // Pass 'io' to these handlers so they can broadcast to rooms
    socket.on("user_message", (data) => handleUserMessage(io, socket, data));
    socket.on("staff_message", (data) => handleStaffMessage(io, socket, data));

    // --- CONNECTION EVENTS ---
    socket.on("disconnect", () => handleDisconnect(socket));
  });
};
