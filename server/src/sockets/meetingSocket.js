const SOCKET_EVENTS = require("./socketEvents");

const connectedUsers = new Map();

const meetingSocket = (io, socket) => {
  let currentMeetingId = null;

  /*
  =====================================================
  JOIN ROOM
  =====================================================
  */

  socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ meetingId, user }) => {
    try {
      if (!meetingId) {
        return;
      }

      // Save user directly on the socket
      socket.data.user = user || {
        name: "Participant",
      };

      socket.join(meetingId);

      currentMeetingId = meetingId;

      const room = io.sockets.adapter.rooms.get(meetingId);

      const existingUsers = [];

      if (room) {
        room.forEach((socketId) => {
          if (socketId === socket.id) {
            return;
          }

          const participant = connectedUsers.get(socketId);

          existingUsers.push({
            socketId,
            user: participant?.user || {
              name: "Participant",
            },
          });
        });
      }

      connectedUsers.set(socket.id, {
        meetingId,
        user: socket.data.user,
      });

      socket.emit(SOCKET_EVENTS.EXISTING_USERS, {
        users: existingUsers,
      });

      socket.to(meetingId).emit(SOCKET_EVENTS.USER_JOINED, {
        socketId: socket.id,
        user: socket.data.user,
      });

      console.log(`👤 ${socket.data.user.name} joined ${meetingId}`);
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
