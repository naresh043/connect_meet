import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const createSocket = () => {
  console.log("🔌 Creating Socket.IO connection:", SOCKET_URL);

  const socket = io(SOCKET_URL, {
    autoConnect: false,

    /*
    ===============================================
    IMPORTANT
    ===============================================

    Match the Render server transport.
    ===============================================
    */

    transports: ["polling"],

    reconnection: true,

    reconnectionAttempts: 10,

    reconnectionDelay: 1000,

    reconnectionDelayMax: 5000,

    timeout: 20000,

    withCredentials: true,
  });

  return socket;
};
   

