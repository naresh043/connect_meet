const SOCKET_EVENTS = require("./socketEvents");

const signaling = (io, socket) => {
  /*
  =====================================================
  WEBRTC OFFER
  =====================================================
  */

  socket.on(SOCKET_EVENTS.OFFER, ({ targetSocketId, offer }) => {
    console.log(
      `📡 Offer: ${socket.id} -> ${targetSocketId}`
    );

    io.to(targetSocketId).emit(SOCKET_EVENTS.OFFER, {
      senderSocketId: socket.id,
      offer,
    });
  });

  /*
  =====================================================
  WEBRTC ANSWER
  =====================================================
  */

  socket.on(
    SOCKET_EVENTS.ANSWER,
    ({ targetSocketId, answer }) => {
      console.log(
        `📡 Answer: ${socket.id} -> ${targetSocketId}`
      );

      io.to(targetSocketId).emit(
        SOCKET_EVENTS.ANSWER,
        {
          senderSocketId: socket.id,
          answer,
        }
      );
    }
  );

  /*
  =====================================================
  ICE CANDIDATE
  =====================================================
  */

  socket.on(
    SOCKET_EVENTS.ICE_CANDIDATE,
    ({ targetSocketId, candidate }) => {
      console.log(
        `🧊 ICE Candidate: ${socket.id} -> ${targetSocketId}`
      );

      io.to(targetSocketId).emit(
        SOCKET_EVENTS.ICE_CANDIDATE,
        {
          senderSocketId: socket.id,
          candidate,
        }
      );
    }
  );
};

module.exports = signaling;