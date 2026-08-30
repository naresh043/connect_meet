const SOCKET_EVENTS = require("./socketEvents");

/*
=====================================================
CONNECTED USERS

socket.id -> {
  meetingId,
  user
}
=====================================================
*/

const connectedUsers = new Map();

const meetingSocket = (io, socket) => {
  /*
  =====================================================
  CURRENT MEETING
  =====================================================
  */

  let currentMeetingId = null;

  /*
  =====================================================
  JOIN ROOM
  =====================================================
  */

  socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ meetingId, user }) => {
    try {
      if (!meetingId) {
        console.log("❌ Meeting ID is required");

        return;
      }

      console.log(`🚪 ${socket.id} is joining ${meetingId}`);

      /*
        ===============================================
        SAVE CURRENT MEETING
        ===============================================
        */

      currentMeetingId = meetingId;

      /*
        ===============================================
        JOIN SOCKET.IO ROOM
        ===============================================
        */

      socket.join(meetingId);

      /*
        ===============================================
        GET ROOM
        ===============================================
        */

      const room = io.sockets.adapter.rooms.get(meetingId);

      /*
        ===============================================
        EXISTING USERS
        ===============================================
        */

      const existingUsers = [];

      if (room) {
        room.forEach((socketId) => {
          /*
            Don't include current user
            */

          if (socketId !== socket.id) {
            const participant = connectedUsers.get(socketId);

            existingUsers.push({
              socketId,

              user: participant?.user || {
                name: "Participant",
                email: "",
              },
            });
          }
        });
      }

      /*
        ===============================================
        SEND EXISTING USERS TO NEW USER
        ===============================================
        */

      socket.emit(SOCKET_EVENTS.EXISTING_USERS, {
        users: existingUsers,
      });

      console.log(`👥 Existing users in ${meetingId}:`, existingUsers);

      /*
        ===============================================
        SAVE CURRENT USER
        ===============================================
        */

      connectedUsers.set(socket.id, {
        meetingId,

        user: user || {
          name: "Participant",
          email: "",
        },
      });

      /*
        ===============================================
        NOTIFY EXISTING USERS
        ===============================================
        */

      socket.to(meetingId).emit(SOCKET_EVENTS.USER_JOINED, {
        socketId: socket.id,

        user: user || {
          name: "Participant",
          email: "",
        },
      });

      console.log(`👤 ${user?.name || "Participant"} joined ${meetingId}`);
    } catch (error) {
      console.error("❌ Join room error:", error);
    }
  });

  /*
  =====================================================
  LEAVE ROOM
  =====================================================
  */

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (meetingId) => {
    try {
      if (!meetingId) {
        return;
      }

      console.log(`🚪 ${socket.id} leaving ${meetingId}`);

      /*
        ===============================================
        LEAVE SOCKET.IO ROOM
        ===============================================
        */

      socket.leave(meetingId);

      /*
        ===============================================
        REMOVE USER FROM MAP
        ===============================================
        */

      connectedUsers.delete(socket.id);

      /*
        ===============================================
        NOTIFY OTHER USERS
        ===============================================
        */

      socket.to(meetingId).emit(SOCKET_EVENTS.USER_LEFT, {
        socketId: socket.id,
      });

      /*
        ===============================================
        CLEAR CURRENT MEETING
        ===============================================
        */

      currentMeetingId = null;

      console.log(`👋 ${socket.id} left ${meetingId}`);
    } catch (error) {
      console.error("❌ Leave room error:", error);
    }
  });

  /*
  =====================================================
  DISCONNECT
  =====================================================
  */

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    try {
      console.log(`❌ Socket disconnected: ${socket.id}`);

      /*
        ===============================================
        IF USER WAS IN A MEETING
        ===============================================
        */

      if (currentMeetingId) {
        socket.to(currentMeetingId).emit(SOCKET_EVENTS.USER_LEFT, {
          socketId: socket.id,
        });

        console.log(
          `👋 Notified meeting ${currentMeetingId} that ${socket.id} left`,
        );
      }

      /*
        ===============================================
        REMOVE USER
        ===============================================
        */

      connectedUsers.delete(socket.id);

      /*
        ===============================================
        CLEAR CURRENT MEETING
        ===============================================
        */

      currentMeetingId = null;
    } catch (error) {
      console.error("❌ Disconnect error:", error);
    }
  });
};

module.exports = meetingSocket;
