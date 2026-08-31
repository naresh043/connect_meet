const SOCKET_EVENTS = require("./socketEvents");

const signaling = (io, socket) => {
  /*
  =====================================================
  OFFER
  =====================================================
  */

  socket.on(SOCKET_EVENTS.OFFER, ({ targetSocketId, offer }) => {
    try {
      if (!targetSocketId || !offer) {
        console.log("❌ Invalid offer data");

        return;
      }

      console.log(`📡 Offer: ${socket.id} → ${targetSocketId}`);

      const targetSocket = io.sockets.sockets.get(targetSocketId);

      if (!targetSocket) {
        console.log("⚠️ Target socket not found:", targetSocketId);

        return;
      }

      targetSocket.emit(SOCKET_EVENTS.OFFER, {
        senderSocketId: socket.id,

        senderUser: getUser(socket),

        offer,
      });
    } catch (error) {
      console.error("❌ Offer error:", error);
    }
  });

  /*
  =====================================================
  ANSWER
  =====================================================
  */

  socket.on(SOCKET_EVENTS.ANSWER, ({ targetSocketId, answer }) => {
    try {
      if (!targetSocketId || !answer) {
        console.log("❌ Invalid answer data");

        return;
      }

      console.log(`📡 Answer: ${socket.id} → ${targetSocketId}`);

      const targetSocket = io.sockets.sockets.get(targetSocketId);

      if (!targetSocket) {
        console.log("⚠️ Target socket not found:", targetSocketId);

        return;
      }

      targetSocket.emit(SOCKET_EVENTS.ANSWER, {
        senderSocketId: socket.id,

        senderUser: getUser(socket),

        answer,
      });
    } catch (error) {
      console.error("❌ Answer error:", error);
    }
  });

  /*
  =====================================================
  ICE CANDIDATE
  =====================================================
  */

  socket.on(SOCKET_EVENTS.ICE_CANDIDATE, ({ targetSocketId, candidate }) => {
    try {
      if (!targetSocketId || !candidate) {
        return;
      }

      console.log(`🧊 ICE: ${socket.id} → ${targetSocketId}`);

      const targetSocket = io.sockets.sockets.get(targetSocketId);

      if (!targetSocket) {
        return;
      }

      targetSocket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
        senderSocketId: socket.id,

        candidate,
      });
    } catch (error) {
      console.error("❌ ICE error:", error);
    }
  });
};

/*
=====================================================
GET USER
=====================================================
*/

const getUser = (socket) => {
  return (
    socket.data?.user || {
      name: "Participant",
    }
  );
};

module.exports = signaling;
