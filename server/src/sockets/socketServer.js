const { Server } = require("socket.io");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.CLIENT_URL ||
        "http://localhost:5173",

      methods: ["GET", "POST"],

      credentials: true,
    },

    transports: ["polling"],
  });

  io.on("connection", (socket) => {
    console.log(
      "🟢 Socket connected:",
      socket.id
    );

    console.log(
      "🧪 BASIC SOCKET TEST:",
      socket.id
    );

    socket.on("disconnect", (reason) => {
      console.log(
        "🔴 Socket disconnected:",
        socket.id,
        reason
      );
    });
  });

  return io;
};

module.exports = initializeSocket;