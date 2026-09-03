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
        console.warn("⚠️ JOIN_ROOM missing meetingId");

        return;
      }

      /*
        =============================================
        NORMALIZE USER
        =============================================
        */

      socket.data.user = {
        ...(user || {}),
        name: user?.name || "Participant",
        isMuted: user?.isMuted ?? false,
        isCameraOff: user?.isCameraOff ?? false,
      };

      /*
        =============================================
        JOIN SOCKET.IO ROOM
        =============================================
        */

      socket.join(meetingId);

      currentMeetingId = meetingId;

      /*
        =============================================
        GET EXISTING USERS
        =============================================
        */

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
              isMuted: false,
              isCameraOff: false,
            },
          });
        });
      }

      /*
        =============================================
        SAVE CURRENT USER
        =============================================
        */

      connectedUsers.set(socket.id, {
        meetingId,
        user: socket.data.user,
      });

      /*
        =============================================
        SEND EXISTING USERS
        =============================================
        */

      socket.emit(SOCKET_EVENTS.EXISTING_USERS, {
        users: existingUsers,
      });

      /*
        =============================================
        NOTIFY EXISTING USERS
        =============================================
        */

      socket.to(meetingId).emit(SOCKET_EVENTS.USER_JOINED, {
        socketId: socket.id,
        user: socket.data.user,
      });

      console.log(`👤 ${socket.data.user.name} joined ${meetingId}`);

      console.log(`👥 Existing users: ${existingUsers.length}`);
    } catch (error) {
      console.error("❌ JOIN_ROOM error:", error);
    }
  });

  /*
  =====================================================
  CAMERA TOGGLE
  =====================================================
  */

  socket.on("camera-toggle", ({ meetingId, isCameraOff }) => {
    try {
      if (!meetingId) {
        return;
      }

      /*
        Make sure user belongs
        to this meeting.
        */

      if (currentMeetingId !== meetingId) {
        return;
      }

      /*
        Update stored user state
        */

      const participant = connectedUsers.get(socket.id);

      if (participant) {
        participant.user = {
          ...participant.user,
          isCameraOff: Boolean(isCameraOff),
        };

        connectedUsers.set(socket.id, participant);
      }

      /*
        Send to everyone else
        */

      socket.to(meetingId).emit("camera-toggle", {
        socketId: socket.id,
        isCameraOff: Boolean(isCameraOff),
      });

      console.log(`📹 ${socket.id} camera: ${isCameraOff ? "OFF" : "ON"}`);
    } catch (error) {
      console.error("❌ Camera toggle error:", error);
    }
  });

  /*
  =====================================================
  MIC TOGGLE
  =====================================================
  */

  socket.on("mic-toggle", ({ meetingId, isMuted }) => {
    try {
      if (!meetingId) {
        return;
      }

      if (currentMeetingId !== meetingId) {
        return;
      }

      /*
        Update stored user state
        */

      const participant = connectedUsers.get(socket.id);

      if (participant) {
        participant.user = {
          ...participant.user,
          isMuted: Boolean(isMuted),
        };

        connectedUsers.set(socket.id, participant);
      }

      /*
        Send to everyone else
        */

      socket.to(meetingId).emit("mic-toggle", {
        socketId: socket.id,
        isMuted: Boolean(isMuted),
      });

      console.log(`🎤 ${socket.id} mic: ${isMuted ? "MUTED" : "UNMUTED"}`);
    } catch (error) {
      console.error("❌ Mic toggle error:", error);
    }
  });

  /*
  =====================================================
  LEAVE ROOM
  =====================================================
  */

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (meetingId) => {
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
