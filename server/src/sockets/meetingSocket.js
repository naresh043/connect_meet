const SOCKET_EVENTS = require("./socketEvents");

const connectedUsers = new Map();

const meetingSocket = (io, socket) => {
  let currentMeetingId = null;

  /*
  =====================================================
  JOIN ROOM
  =====================================================
  */

  socket.on(SOCKET_EVENTS.JOIN_ROOM, (data) => {
    try {
      console.log("📥 JOIN_ROOM received:", data);

      const meetingId = data?.meetingId;
      const user = data?.user;

      if (!meetingId) {
        console.log("❌ meetingId missing");
        return;
      }

      currentMeetingId = meetingId;

      /*
      ===============================================
      JOIN SOCKET.IO ROOM
      ===============================================
      */

      socket.join(meetingId);

      console.log(`🚪 ${socket.id} joined room ${meetingId}`);

      /*
      ===============================================
      GET EXISTING USERS
      ===============================================
      */

      const room = io.sockets.adapter.rooms.get(meetingId);

      const existingUsers = [];

      if (room) {
        for (const socketId of room) {
          if (socketId === socket.id) {
            continue;
          }

          const participant = connectedUsers.get(socketId);

          if (participant) {
            existingUsers.push({
              socketId: socketId,
              user: participant.user || {
                name: "Participant",
              },
            });
          }
        }
      }

      console.log(`👥 Existing users in ${meetingId}:`, existingUsers.length);

      /*
      ===============================================
      SAVE CURRENT USER
      ===============================================
      */

      connectedUsers.set(socket.id, {
        meetingId,
        user: user || {
          name: "Participant",
        },
      });

      /*
      ===============================================
      SEND EXISTING USERS
      ===============================================
      */

      socket.emit(SOCKET_EVENTS.EXISTING_USERS, {
        users: existingUsers,
      });

      console.log(`📤 Existing users sent to ${socket.id}`);

      /*
      ===============================================
      NOTIFY OTHER USERS
      ===============================================
      */

      socket.to(meetingId).emit(SOCKET_EVENTS.USER_JOINED, {
        socketId: socket.id,
        user: user || {
          name: "Participant",
        },
      });

      console.log(`📢 User joined event sent for ${socket.id}`);
    } catch (error) {
      console.error("❌ JOIN_ROOM error:", error);
    }
  });

  /*
  =====================================================
  LEAVE ROOM
  =====================================================
  */

  socket.on("leave-room", (meetingId) => {
    try {
      const roomId = meetingId || currentMeetingId;

      if (!roomId) {
        return;
      }

      console.log(`👋 ${socket.id} leaving ${roomId}`);

      socket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, {
        socketId: socket.id,
      });

      socket.leave(roomId);

      connectedUsers.delete(socket.id);

      currentMeetingId = null;
    } catch (error) {
      console.error("❌ LEAVE_ROOM error:", error);
    }
  });

  /*
  =====================================================
  DISCONNECT
  =====================================================
  */

  socket.on("disconnect", (reason) => {
    console.log(`🔴 Socket disconnected: ${socket.id}`, reason);

    if (currentMeetingId) {
      socket.to(currentMeetingId).emit(SOCKET_EVENTS.USER_LEFT, {
        socketId: socket.id,
      });

      console.log(`👋 Notified ${currentMeetingId} about ${socket.id}`);
    }

    connectedUsers.delete(socket.id);

    currentMeetingId = null;
  });
};

module.exports = meetingSocket;
