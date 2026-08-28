const http = require("http");
// const { Server } = require("socket.io");
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const initializeSocket = require("./src/sockets/socketServer");

const PORT = process.env.PORT || 5000;

// Create HTTP server using Express app
const server = http.createServer(app);

const io = initializeSocket(server);

// Create Socket.IO server
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// Socket.IO connection
// io.on("connection", (socket) => {
//   console.log(`Socket connected: ${socket.id}`);

//   socket.on("disconnect", () => {
//     console.log(`Socket disconnected: ${socket.id}`);
//   });
// });

// Start server
const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    server.listen(PORT,"0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO initialized`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

