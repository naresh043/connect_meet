const { Server } = require("socket.io");

const meetingSocket = require("./meetingSocket");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",

      methods: ["GET", "POST"],

      credentials: true,
    },

    transports: ["polling"],
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    console.log("🧪 Socket connection established:", socket.id);

    /*
    ===============================================
    MEETING SOCKET
    ===============================================
    */

    meetingSocket(io, socket);

    /*
    ===============================================
    DISCONNECT
    ===============================================
    */

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", socket.id, reason);
    });
  });

  return io;
};

module.exports = initializeSocket;
