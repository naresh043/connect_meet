const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO");
  console.log("Socket ID:", socket.id);

  // Join a meeting
  socket.emit("join-room", "TEST123");
});

socket.on("user-joined", (data) => {
  console.log("👤 User joined:");
  console.log(data);
});

socket.on("user-left", (data) => {
  console.log("👋 User left:");
  console.log(data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
