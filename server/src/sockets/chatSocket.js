const crypto = require("crypto");

const SOCKET_EVENTS = require("./socketEvents");

const MAX_MESSAGE_LENGTH = 1000;

const chatSocket = (io, socket) => {
  /*
  =====================================================
  SEND MESSAGE
  =====================================================
  */

  socket.on(SOCKET_EVENTS.SEND_MESSAGE, (payload = {}) => {
    try {
      const {
        meetingId,
        text,
      } = payload;

      /*
      =====================================================
      VALIDATE MEETING
      =====================================================
      */

      if (
        typeof meetingId !== "string" ||
        !meetingId.trim()
      ) {
        console.warn(
          `⚠️ Chat rejected: missing meetingId (${socket.id})`
        );

        return;
      }

      const roomId = meetingId.trim();

      /*
      =====================================================
      VERIFY SOCKET IS INSIDE THE MEETING
      =====================================================
      */

      const room = io.sockets.adapter.rooms.get(roomId);

      if (!room || !room.has(socket.id)) {
        console.warn(
          `⚠️ Unauthorized chat attempt: ${socket.id} → ${roomId}`
        );

        return;
      }

      /*
      =====================================================
      VALIDATE MESSAGE TEXT
      =====================================================
      */

      if (typeof text !== "string") {
        console.warn(
          `⚠️ Chat rejected: invalid text (${socket.id})`
        );

        return;
      }

      const trimmedText = text.trim();

      if (!trimmedText) {
        return;
      }

      /*
      =====================================================
      MESSAGE LENGTH LIMIT
      =====================================================
      */

      if (trimmedText.length > MAX_MESSAGE_LENGTH) {
        console.warn(
          `⚠️ Chat rejected: message too long (${socket.id})`
        );

        socket.emit("chat-error", {
          message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
        });

        return;
      }

      /*
      =====================================================
      GET USER FROM SERVER-SIDE SOCKET DATA
      =====================================================

      Do NOT trust senderId/senderName from frontend.

      meetingSocket.js already sets:

      socket.data.user
      =====================================================
      */

      const user = socket.data?.user;

      if (!user) {
        console.warn(
          `⚠️ Chat rejected: user information missing (${socket.id})`
        );

        return;
      }

      /*
      =====================================================
      NORMALIZE USER ID
      =====================================================
      */

      const senderId =
        user.id ||
        user._id?.toString();

      if (!senderId) {
        console.warn(
          `⚠️ Chat rejected: sender ID missing (${socket.id})`
        );

        return;
      }

      /*
      =====================================================
      NORMALIZE USER NAME
      =====================================================
      */

      const senderName =
        typeof user.name === "string" &&
        user.name.trim()
          ? user.name.trim()
          : "Participant";

      /*
      =====================================================
      CREATE MESSAGE
      =====================================================
      */

      const message = {
        id: crypto.randomUUID(),

        meetingId: roomId,

        senderId,

        senderName,

        text: trimmedText,

        timestamp: new Date().toISOString(),
      };

      /*
      =====================================================
      BROADCAST TO MEETING ROOM
      =====================================================
      */

      io.to(roomId).emit(
        SOCKET_EVENTS.RECEIVE_MESSAGE,
        message
      );

      /*
      =====================================================
      LOG
      =====================================================
      */

      console.log(
        `💬 Message sent | meeting=${roomId} | user=${senderName}`
      );
    } catch (error) {
      console.error(
        "❌ Chat message error:",
        error
      );

      socket.emit("chat-error", {
        message:
          "Unable to send your message. Please try again.",
      });
    }
  });
};

module.exports = chatSocket;