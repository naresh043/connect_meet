const { io } = require("socket.io-client");
const readline = require("readline");

const SERVER_URL = "http://localhost:5000";
const MEETING_ID = "TEST123";

const USER = {
  id: "test-user-2",
  name: "Naresh",
};

const socket = io(SERVER_URL, {
  transports: ["polling"],
  reconnection: true,
});

/*
=====================================================
TERMINAL INPUT
=====================================================
*/

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/*
=====================================================
CONNECT
=====================================================
*/

socket.on("connect", () => {
  console.log("");
  console.log("======================================");
  console.log("✅ CONNECTED");
  console.log("======================================");

  console.log("Socket ID:", socket.id);
  console.log("User:", USER.name);
  console.log("Meeting:", MEETING_ID);

  /*
  =====================================================
  JOIN ROOM
  =====================================================
  */

  socket.emit("join-room", {
    meetingId: MEETING_ID,
    user: USER,
  });

  console.log("");
  console.log("📍 Join request sent");
  console.log("");
  console.log("💬 Type a message and press ENTER");
  console.log("");
});

/*
=====================================================
EXISTING USERS
=====================================================
*/

socket.on("existing-users", (data) => {
  console.log("");
  console.log("👥 Existing users:");

  console.dir(data, {
    depth: null,
  });

  console.log("");
});

/*
=====================================================
USER JOINED
=====================================================
*/

socket.on("user-joined", (data) => {
  console.log("");
  console.log("👤 User joined:");

  console.dir(data, {
    depth: null,
  });

  console.log("");
});

/*
=====================================================
USER LEFT
=====================================================
*/

socket.on("user-left", (data) => {
  console.log("");
  console.log("👋 User left:");

  console.dir(data, {
    depth: null,
  });

  console.log("");
});

/*
=====================================================
RECEIVE CHAT MESSAGE
=====================================================
*/

socket.on("receive-message", (message) => {
  console.log("");
  console.log("======================================");
  console.log("💬 CHAT MESSAGE RECEIVED");
  console.log("======================================");

  console.log("Message ID:", message.id);
  console.log("Meeting ID:", message.meetingId);
  console.log("Sender ID:", message.senderId);
  console.log("Sender Name:", message.senderName);
  console.log("Text:", message.text);
  console.log("Timestamp:", message.timestamp);

  console.log("======================================");
  console.log("");
});

/*
=====================================================
CHAT ERROR
=====================================================
*/

socket.on("chat-error", (error) => {
  console.log("");
  console.log("======================================");
  console.log("❌ CHAT ERROR");
  console.log("======================================");

  console.dir(error, {
    depth: null,
  });

  console.log("======================================");
  console.log("");
});

/*
=====================================================
SEND CHAT MESSAGE
=====================================================
*/

rl.on("line", (input) => {
  const text = input.trim();

  if (!text) {
    return;
  }

  console.log("");
  console.log("📤 Sending message:", text);

  socket.emit("send-message", {
    meetingId: MEETING_ID,
    text,
  });

  console.log("");
});

/*
=====================================================
CONNECTION ERROR
=====================================================
*/

socket.on("connect_error", (error) => {
  console.log("");
  console.log("❌ CONNECTION ERROR");
  console.log("Message:", error.message);
  console.log("");
});

/*
=====================================================
DISCONNECT
=====================================================
*/

socket.on("disconnect", (reason) => {
  console.log("");
  console.log("🔴 DISCONNECTED");
  console.log("Reason:", reason);
  console.log("");
});