const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  // Meeting
  JOIN_ROOM: "join-room",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",

  // WebRTC signaling
  OFFER: "offer",
  ANSWER: "answer",
  ICE_CANDIDATE: "ice-candidate",

  // Chat
  SEND_MESSAGE: "send-message",
  RECEIVE_MESSAGE: "receive-message",

  // Media controls
  CAMERA_TOGGLE: "camera-toggle",
  MIC_TOGGLE: "mic-toggle",

  // Screen sharing
  SCREEN_SHARE_STARTED: "screen-share-started",
  SCREEN_SHARE_STOPPED: "screen-share-stopped",

  // Meeting
  MEETING_ENDED: "meeting-ended",
};

module.exports = SOCKET_EVENTS;