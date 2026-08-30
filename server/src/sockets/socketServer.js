// // const SOCKET_EVENTS = require("./socketEvents");

// // const meetingSocket = (io, socket) => {
// //   /*
// //   =====================================================
// //   JOIN MEETING ROOM
// //   =====================================================
// //   */

// //   socket.on(SOCKET_EVENTS.JOIN_ROOM, (meetingId) => {
// //     try {
// //       if (!meetingId) {
// //         return;
// //       }

// //       // Join Socket.IO room
// //       socket.join(meetingId);

// //       console.log(`Socket ${socket.id} joined meeting ${meetingId}`);

// //       /*
// //       Notify other users in the room
// //       */

// //       socket.to(meetingId).emit(SOCKET_EVENTS.USER_JOINED, {
// //         socketId: socket.id,
// //       });
// //     } catch (error) {
// //       console.error("Join room error:", error);
// //     }
// //   });

// //   /*
// //   =====================================================
// //   LEAVE MEETING ROOM
// //   =====================================================
// //   */

// //   socket.on("leave-room", (meetingId) => {
// //     try {
// //       if (!meetingId) {
// //         return;
// //       }

// //       socket.leave(meetingId);

// //       socket.to(meetingId).emit(SOCKET_EVENTS.USER_LEFT, {
// //         socketId: socket.id,
// //       });

// //       console.log(`Socket ${socket.id} left meeting ${meetingId}`);
// //     } catch (error) {
// //       console.error("Leave room error:", error);
// //     }
// //   });

// //   /*
// //   =====================================================
// //   DISCONNECT
// //   =====================================================
// //   */

// //   socket.on(SOCKET_EVENTS.DISCONNECT, () => {
// //     console.log(`Socket disconnected: ${socket.id}`);
// //   });
// // };

// // module.exports = meetingSocket;

// const { Server } = require("socket.io");

// const meetingSocket = require("./meetingSocket");

// const initializeSocket = (server) => {
//   // Create Socket.IO server
//   const io = new Server(server, {
//     cors: {
//       origin:
//         process.env.CLIENT_URL || "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   // Socket.IO connection
//   io.on("connection", (socket) => {
//     console.log(`🔌 Socket connected: ${socket.id}`);

//     // Initialize meeting socket events
//     meetingSocket(io, socket);

//     // Disconnect
//     socket.on("disconnect", () => {
//       console.log(
//         `🔌 Socket disconnected: ${socket.id}`
//       );
//     });
//   });

//   return io;
// };

// module.exports = initializeSocket;
const { Server } = require("socket.io");

const meetingSocket = require("./meetingSocket");

const signaling = require("./signaling");

const initializeSocket = (server) => {
  /*
  =====================================================
  CREATE SOCKET.IO SERVER
  =====================================================
  */

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",

      methods: ["GET", "POST"],

      credentials: true,
    },

    /*
    Keep websocket as primary transport.
    Socket.IO can still fall back if needed.
    */

    transports: ["websocket", "polling"],
  });

  /*
  =====================================================
  SOCKET CONNECTION
  =====================================================
  */

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    /*
      ===============================================
      MEETING EVENTS
      ===============================================
      */

    meetingSocket(io, socket);

    /*
      ===============================================
      WEBRTC SIGNALING
      ===============================================
      */

    signaling(io, socket);

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
