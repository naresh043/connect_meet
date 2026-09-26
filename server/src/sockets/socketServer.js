const { Server } = require("socket.io");

const meetingSocket = require("./meetingSocket");
const signaling = require("./signaling");
const chatSocket = require("./chatSocket");

const initializeSocket = (server) => {
  /*
  =====================================================
  CORS
  =====================================================
  */

  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : ["http://localhost:5173"];

  /*
  =====================================================
  SOCKET.IO SERVER
  =====================================================
  */

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },

    transports: ["polling"],
  });

  /*
  =====================================================
  CONNECTION
  =====================================================
  */

  io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    /*
    ===================================================
    MEETING ROOM
    ===================================================
    */

    meetingSocket(io, socket);

    /*
    ===================================================
    WEBRTC SIGNALING
    ===================================================
    */

    signaling(io, socket);

    /*
    ===================================================
    CHAT
    ===================================================
    */

    chatSocket(io, socket);

    /*
    ===================================================
    DISCONNECT
    ===================================================
    */

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Main socket disconnected: ${socket.id}`, reason);
    });
  });

  return io;
};

module.exports = initializeSocket;
