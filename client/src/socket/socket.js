import { io } from "socket.io-client";

/*
=====================================================
SOCKET.IO SERVER URL
=====================================================
*/

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

/*
=====================================================
CREATE SOCKET
=====================================================
*/

export const createSocket = () => {
  console.log("🔌 Creating Socket.IO connection:", SOCKET_URL);

  const socket = io(SOCKET_URL, {
    /*
    ===============================================
    DON'T CONNECT AUTOMATICALLY
    ===============================================
    */

    autoConnect: false,

    /*
    ===============================================
    TRANSPORT
    ===============================================

    Let Socket.IO negotiate the best transport.

    We are intentionally NOT using:

    transports: ["websocket"]

    This is better while testing Render.
    ===============================================
    */

    reconnection: true,

    reconnectionAttempts: 10,

    reconnectionDelay: 1000,

    reconnectionDelayMax: 5000,

    timeout: 20000,

    /*
    ===============================================
    CREDENTIALS
    ===============================================
    */

    withCredentials: true,
  });

  return socket;
};
