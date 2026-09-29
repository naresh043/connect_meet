const mongoose = require("mongoose");

const Message = require("../models/Message");
const Meeting = require("../models/Meeting");
const Participant = require("../models/Participant");

const SOCKET_EVENTS = require("./socketEvents");

const MAX_MESSAGE_LENGTH = 1000;

const chatSocket = (io, socket) => {
  /**
   * =====================================================
   * SEND MESSAGE
   * =====================================================
   */

  socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload = {}) => {
    try {
      /**
       * =====================================================
       * VALIDATE PAYLOAD
       * =====================================================
       */

      const { meetingId, text } = payload;

      if (typeof meetingId !== "string" || !meetingId.trim()) {
        console.warn(`⚠️ Chat rejected: missing meetingId (${socket.id})`);

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "Meeting ID is required.",
        });

        return;
      }

      const roomId = meetingId.trim();

      /**
       * =====================================================
       * VERIFY SOCKET IS INSIDE MEETING ROOM
       * =====================================================
       */

      const room = io.sockets.adapter.rooms.get(roomId);

      if (!room || !room.has(socket.id)) {
        console.warn(`⚠️ Unauthorized chat attempt: ${socket.id} → ${roomId}`);

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "You are not connected to this meeting.",
        });

        return;
      }

      /**
       * =====================================================
       * VALIDATE MESSAGE TEXT
       * =====================================================
       */

      if (typeof text !== "string") {
        console.warn(`⚠️ Chat rejected: invalid text (${socket.id})`);

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "Invalid message.",
        });

        return;
      }

      const trimmedText = text.trim();

      if (!trimmedText) {
        return;
      }

      /**
       * =====================================================
       * MESSAGE LENGTH LIMIT
       * =====================================================
       */

      if (trimmedText.length > MAX_MESSAGE_LENGTH) {
        console.warn(`⚠️ Chat rejected: message too long (${socket.id})`);

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
        });

        return;
      }

      /**
       * =====================================================
       * GET AUTHENTICATED SOCKET USER
       * =====================================================
       *
       * Do NOT trust senderId/senderName from frontend.
       *
       * meetingSocket.js sets socket.data.user.
       */

      const user = socket.data?.user;

      if (!user) {
        console.warn(
          `⚠️ Chat rejected: user information missing (${socket.id})`,
        );

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "Authentication required.",
        });

        return;
      }

      /**
       * =====================================================
       * NORMALIZE USER ID
       * =====================================================
       */

      const senderId = user.id || user._id?.toString() || user.userId;

      if (!senderId) {
        console.warn(`⚠️ Chat rejected: sender ID missing (${socket.id})`);

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "User information is invalid.",
        });

        return;
      }

      /**
       * =====================================================
       * VALIDATE MONGODB USER ID
       * =====================================================
       */

      if (!mongoose.Types.ObjectId.isValid(senderId)) {
        console.warn(`⚠️ Chat rejected: invalid sender ID (${socket.id})`);

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "Invalid user information.",
        });

        return;
      }

      /**
       * =====================================================
       * GET MEETING
       * =====================================================
       */

      const meeting = await Meeting.findOne({
        meetingId: roomId,
      }).select("_id meetingId status host");

      if (!meeting) {
        console.warn(`⚠️ Chat rejected: meeting not found (${roomId})`);

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "Meeting not found.",
        });

        return;
      }

      /**
       * =====================================================
       * VERIFY MEETING IS ACTIVE
       * =====================================================
       */

      if (meeting.status !== "active") {
        console.warn(`⚠️ Chat rejected: meeting ended (${roomId})`);

        socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "This meeting has ended.",
        });

        return;
      }

      /**
       * =====================================================
       * VERIFY USER AUTHORIZATION
       * =====================================================
       *
       * Host is allowed.
       *
       * Otherwise user must have a Participant
       * record for this meeting.
       */

      const isHost =
        meeting.host && meeting.host.toString() === senderId.toString();

      if (!isHost) {
        const participant = await Participant.findOne({
          meeting: meeting._id,
          user: senderId,
        }).select("_id role");

        if (!participant) {
          console.warn(
            `⚠️ Chat rejected: unauthorized user ${senderId} → ${roomId}`,
          );

          socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
            message: "You are not authorized to chat in this meeting.",
          });

          return;
        }
      }

      /**
       * =====================================================
       * CREATE DATABASE MESSAGE
       * =====================================================
       */

      const savedMessage = await Message.create({
        meeting: meeting._id,

        sender: senderId,

        text: trimmedText,

        /*
         * Meeting is active.
         *
         * Retention starts when the meeting ends.
         */
        expiresAt: null,
      });

      /**
       * =====================================================
       * CREATE SOCKET RESPONSE
       * =====================================================
       */

      const message = {
        id: savedMessage._id.toString(),

        meetingId: meeting.meetingId,

        senderId: senderId.toString(),

        senderName:
          typeof user.name === "string" && user.name.trim()
            ? user.name.trim()
            : "Participant",

        text: savedMessage.text,

        timestamp: savedMessage.createdAt.toISOString(),
      };

      /**
       * =====================================================
       * BROADCAST SAVED MESSAGE
       * =====================================================
       *
       * IMPORTANT:
       *
       * Broadcast only AFTER MongoDB successfully
       * saves the message.
       */

      io.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);

      /**
       * =====================================================
       * LOG
       * =====================================================
       */

      console.log(
        `💬 Message saved | meeting=${roomId} | user=${message.senderName} | message=${savedMessage._id}`,
      );
    } catch (error) {
      console.error("❌ Chat message error:", error);

      socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
        message: "Unable to send your message. Please try again.",
      });
    }
  });
};

module.exports = chatSocket;
