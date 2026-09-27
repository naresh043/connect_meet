const SOCKET_EVENTS = require("./socketEvents");

/*
 * =====================================================
 * CONNECTED USERS
 * =====================================================
 *
 * socketId -> {
 *   meetingId,
 *   user
 * }
 */

const connectedUsers = new Map();

/*
 * =====================================================
 * USER CONNECTION INDEX
 * =====================================================
 *
 * `${meetingId}:${userId}` -> socketId
 *
 * This prevents the same user from creating multiple
 * participant entries in the same meeting.
 */

const userMeetingSockets = new Map();

const getUserId = (user) => {
  return user?.id || user?._id?.toString() || user?.userId || null;
};

const getUserMeetingKey = (meetingId, userId) => {
  return `${meetingId}:${userId}`;
};

const removeSocketFromIndexes = (socketId) => {
  const participant = connectedUsers.get(socketId);

  if (!participant) {
    return;
  }

  const userId = getUserId(participant.user);

  if (userId && participant.meetingId) {
    const key = getUserMeetingKey(participant.meetingId, userId);

    if (userMeetingSockets.get(key) === socketId) {
      userMeetingSockets.delete(key);
    }
  }

  connectedUsers.delete(socketId);
};

const meetingSocket = (io, socket) => {
  let currentMeetingId = null;

  /**
   * =====================================================
   * JOIN ROOM
   * =====================================================
   */

  socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ meetingId, user } = {}) => {
    try {
      if (typeof meetingId !== "string" || !meetingId.trim()) {
        console.warn("⚠️ JOIN_ROOM missing meetingId");
        return;
      }

      const roomId = meetingId.trim();

      /**
       * =================================================
       * NORMALIZE USER
       * =================================================
       */

      const normalizedUser = {
        ...(user || {}),

        name:
          typeof user?.name === "string" && user.name.trim()
            ? user.name.trim()
            : "Participant",

        isMuted: user?.isMuted ?? false,

        isCameraOff: user?.isCameraOff ?? false,
      };

      const userId = getUserId(normalizedUser);

      /**
       * =================================================
       * USER ID IS REQUIRED
       * =================================================
       */

      if (!userId) {
        console.warn(`⚠️ JOIN_ROOM rejected: missing user ID (${socket.id})`);

        socket.emit("meeting-error", {
          message: "User identity is required to join the meeting.",
        });

        return;
      }

      /**
       * =================================================
       * HANDLE ALREADY JOINED SOCKET
       * =================================================
       */

      if (currentMeetingId) {
        console.warn(
          `⚠️ Socket ${socket.id} already joined ${currentMeetingId}`,
        );

        return;
      }

      /**
       * =================================================
       * CHECK DUPLICATE USER
       * =================================================
       */

      const userMeetingKey = getUserMeetingKey(roomId, userId);

      const existingSocketId = userMeetingSockets.get(userMeetingKey);

      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);

        console.log(
          `♻️ Replacing duplicate connection | user=${normalizedUser.name} | old=${existingSocketId} | new=${socket.id}`,
        );

        /*
         * Notify existing participants that the old
         * connection is leaving.
         */

        if (existingSocket) {
          existingSocket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, {
            socketId: existingSocketId,
          });

          /*
           * Remove old socket from Socket.IO room.
           */

          existingSocket.leave(roomId);

          /*
           * Disconnect old socket.
           */

          existingSocket.disconnect(true);
        }

        /*
         * Remove old backend index entry.
         */

        removeSocketFromIndexes(existingSocketId);
      }

      /**
       * =================================================
       * STORE USER ON SOCKET
       * =================================================
       */

      socket.data.user = normalizedUser;

      /**
       * =================================================
       * JOIN SOCKET.IO ROOM
       * =================================================
       */

      socket.join(roomId);

      currentMeetingId = roomId;

      /**
       * =================================================
       * SAVE SOCKET
       * =================================================
       */

      connectedUsers.set(socket.id, {
        meetingId: roomId,
        user: normalizedUser,
      });

      userMeetingSockets.set(userMeetingKey, socket.id);

      /**
       * =================================================
       * GET EXISTING USERS
       * =================================================
       */

      const room = io.sockets.adapter.rooms.get(roomId);

      const existingUsers = [];

      if (room) {
        room.forEach((socketId) => {
          if (socketId === socket.id) {
            return;
          }

          const participant = connectedUsers.get(socketId);

          if (!participant) {
            return;
          }

          /*
           * Extra protection:
           * Don't return duplicate users.
           */

          const participantUserId = getUserId(participant.user);

          if (participantUserId === userId) {
            return;
          }

          existingUsers.push({
            socketId,

            user: participant.user || {
              name: "Participant",
              isMuted: false,
              isCameraOff: false,
            },
          });
        });
      }

      /**
       * =================================================
       * SEND EXISTING USERS
       * =================================================
       */

      socket.emit(SOCKET_EVENTS.EXISTING_USERS, {
        users: existingUsers,
      });

      /**
       * =================================================
       * NOTIFY EXISTING USERS
       * =================================================
       */

      socket.to(roomId).emit(SOCKET_EVENTS.USER_JOINED, {
        socketId: socket.id,
        user: normalizedUser,
      });

      /**
       * =================================================
       * LOG
       * =================================================
       */

      console.log(`👤 ${normalizedUser.name} joined ${roomId}`);

      console.log(`🆔 User ID: ${userId}`);

      console.log(`🔌 Socket ID: ${socket.id}`);

      console.log(`👥 Existing users: ${existingUsers.length}`);
    } catch (error) {
      console.error("❌ JOIN_ROOM error:", error);
    }
  });

  /**
   * =====================================================
   * CAMERA TOGGLE
   * =====================================================
   */

  socket.on("camera-toggle", ({ meetingId, isCameraOff } = {}) => {
    try {
      if (!meetingId || currentMeetingId !== meetingId) {
        return;
      }

      const participant = connectedUsers.get(socket.id);

      if (participant) {
        participant.user = {
          ...participant.user,
          isCameraOff: Boolean(isCameraOff),
        };

        connectedUsers.set(socket.id, participant);
      }

      socket.to(meetingId).emit("camera-toggle", {
        socketId: socket.id,
        isCameraOff: Boolean(isCameraOff),
      });

      console.log(`📹 ${socket.id} camera: ${isCameraOff ? "OFF" : "ON"}`);
    } catch (error) {
      console.error("❌ Camera toggle error:", error);
    }
  });

  /**
   * =====================================================
   * MIC TOGGLE
   * =====================================================
   */

  socket.on("mic-toggle", ({ meetingId, isMuted } = {}) => {
    try {
      if (!meetingId || currentMeetingId !== meetingId) {
        return;
      }

      const participant = connectedUsers.get(socket.id);

      if (participant) {
        participant.user = {
          ...participant.user,
          isMuted: Boolean(isMuted),
        };

        connectedUsers.set(socket.id, participant);
      }

      socket.to(meetingId).emit("mic-toggle", {
        socketId: socket.id,
        isMuted: Boolean(isMuted),
      });

      console.log(`🎤 ${socket.id} mic: ${isMuted ? "MUTED" : "UNMUTED"}`);
    } catch (error) {
      console.error("❌ Mic toggle error:", error);
    }
  });

  /**
   * =====================================================
   * LEAVE ROOM
   * =====================================================
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

      removeSocketFromIndexes(socket.id);

      currentMeetingId = null;
    } catch (error) {
      console.error("❌ LEAVE_ROOM error:", error);
    }
  });

  /**
   * =====================================================
   * DISCONNECT
   * =====================================================
   */

  socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
    console.log(`🔴 Socket disconnected: ${socket.id}`, reason);

    if (currentMeetingId) {
      socket.to(currentMeetingId).emit(SOCKET_EVENTS.USER_LEFT, {
        socketId: socket.id,
      });

      console.log(`👋 Notified ${currentMeetingId} about ${socket.id}`);
    }

    removeSocketFromIndexes(socket.id);

    currentMeetingId = null;
  });
};

module.exports = meetingSocket;
