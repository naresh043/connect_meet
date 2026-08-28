const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const meetingId = "TEST123";

socket.on("connect", () => {
  console.log("=================================");
  console.log("Connected");
  console.log("Socket ID:", socket.id);
  console.log("=================================");

  socket.emit("join-room", meetingId);
});

/*
=====================================================
EXISTING USERS
=====================================================
*/

socket.on("existing-users", (data) => {
  console.log("👥 Existing users:");
  console.log(data);
});

/*
=====================================================
USER JOINED
=====================================================
*/

socket.on("user-joined", (data) => {
  console.log("👤 User joined:");
  console.log(data);
});

/*
=====================================================
OFFER
=====================================================
*/

socket.on("offer", (data) => {
  console.log("📡 OFFER RECEIVED");
  console.log(data);

  /*
  Send fake answer back
  */

  socket.emit("answer", {
    targetSocketId: data.senderSocketId,

    answer: {
      type: "answer",
      fake: true,
      message: "Fake WebRTC answer",
    },
  });
});

/*
=====================================================
ANSWER
=====================================================
*/

socket.on("answer", (data) => {
  console.log("📡 ANSWER RECEIVED");
  console.log(data);
});

/*
=====================================================
ICE CANDIDATE
=====================================================
*/

socket.on("ice-candidate", (data) => {
  console.log("🧊 ICE CANDIDATE RECEIVED");
  console.log(data);
});

/*
=====================================================
USER LEFT
=====================================================
*/

socket.on("user-left", (data) => {
  console.log("👋 User left");
  console.log(data);
});


setTimeout(() => {
  socket.emit("offer", {
    targetSocketId: "PUT_B_SOCKET_ID_HERE",

    offer: {
      type: "offer",
      fake: true,
      message: "Fake WebRTC offer",
    },
  });
}, 5000);
/*
=====================================================
DISCONNECT
=====================================================
*/

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});