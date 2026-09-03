const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  JOIN_ROOM: "join-room",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
  EXISTING_USERS: "existing-users",

  OFFER: "offer",
  ANSWER: "answer",
  ICE_CANDIDATE: "ice-candidate",

  SEND_MESSAGE: "send-message",
  RECEIVE_MESSAGE: "receive-message",

  CAMERA_TOGGLE: "camera-toggle",
  MIC_TOGGLE: "mic-toggle",

  SCREEN_SHARE_STARTED: "screen-share-started",
  SCREEN_SHARE_STOPPED: "screen-share-stopped",

  MEETING_ENDED: "meeting-ended",
};

export default SOCKET_EVENTS;