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

    meetingSocket(io, socket);

    socket.on("disconnect", (reason) => {
      console.log("🔴 Main socket disconnect:", socket.id, reason);
    });
  });

  return io;
};

module.exports = initializeSocket;
