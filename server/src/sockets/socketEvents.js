const SOCKET_EVENTS = {
  // =====================================================
  // SOCKET CONNECTION
  // =====================================================

  CONNECTION: "connection",

  DISCONNECT: "disconnect",

  // =====================================================
  // MEETING
  // =====================================================

  JOIN_ROOM: "join-room",

  LEAVE_ROOM: "leave-room",

  EXISTING_USERS: "existing-users",

  USER_JOINED: "user-joined",

  USER_LEFT: "user-left",

  MEETING_ENDED: "meeting-ended",

  // =====================================================
  // WEBRTC SIGNALING
  // =====================================================

  OFFER: "offer",

  ANSWER: "answer",

  ICE_CANDIDATE: "ice-candidate",

  // =====================================================
  // CHAT
  // =====================================================

  SEND_MESSAGE: "send-message",

  RECEIVE_MESSAGE: "receive-message",

  // =====================================================
  // MEDIA CONTROLS
  // =====================================================

  CAMERA_TOGGLE: "camera-toggle",

  MIC_TOGGLE: "mic-toggle",

  // =====================================================
  // SCREEN SHARING
  // =====================================================

  SCREEN_SHARE_STARTED: "screen-share-started",

  SCREEN_SHARE_STOPPED: "screen-share-stopped",
};

module.exports = SOCKET_EVENTS;
