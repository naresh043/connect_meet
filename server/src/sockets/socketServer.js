const { Server } = require("socket.io");

const meetingSocket = require("./meetingSocket");

const signaling = require("./signaling");

const initializeSocket = (server) => {
  // *Allowed frontend origins from environment variable*

  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
    : ["http://localhost:5173"];

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling"],
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    /*
     *===============================================*
     * MEETING ROOM
     *===============================================*
     */

    meetingSocket(io, socket);

    /*
     *===============================================*
     * WEBRTC SIGNALING
     *===============================================*
     */

    signaling(io, socket);

    /*
     *===============================================*
     * DISCONNECT
     *===============================================*
     */

    socket.on("disconnect", (reason) => {
      console.log("🔴 Main socket disconnected:", socket.id, reason);
    });
  });

  return io;
};

module.exports = initializeSocket;
