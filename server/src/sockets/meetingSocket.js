const SOCKET_EVENTS = require("./socketEvents");

const meetingSocket = (io, socket) => {
  let currentMeetingId = null;

  /*
  =====================================================
  JOIN ROOM
  =====================================================
  */

  socket.on(SOCKET_EVENTS.JOIN_ROOM, (meetingId) => {
    if (!meetingId) {
      return;
    }

    currentMeetingId = meetingId;

    /*
      Get users already inside room
      */

    const room = io.sockets.adapter.rooms.get(meetingId);

    const existingUsers = room ? [...room] : [];

    /*
      Join room
      */

    socket.join(meetingId);

    console.log(`👤 ${socket.id} joined ${meetingId}`);

    /*
      Tell new user who is already inside
      */

    socket.emit("existing-users", {
      users: existingUsers,
    });

    /*
      Tell existing users about new user
      */

    socket.to(meetingId).emit(SOCKET_EVENTS.USER_JOINED, {
      socketId: socket.id,
    });
  });

  /*
  =====================================================
  LEAVE ROOM
  =====================================================
  */

  socket.on("leave-room", (meetingId) => {
    if (!meetingId) {
      return;
    }

    socket.leave(meetingId);

    socket.to(meetingId).emit(SOCKET_EVENTS.USER_LEFT, {
      socketId: socket.id,
    });

    currentMeetingId = null;

    console.log(`👋 ${socket.id} left ${meetingId}`);
  });

  /*
  =====================================================
  DISCONNECT
  =====================================================
  */

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);

    if (currentMeetingId) {
      socket.to(currentMeetingId).emit(SOCKET_EVENTS.USER_LEFT, {
        socketId: socket.id,
      });
    }
  });
};

module.exports = meetingSocket;
