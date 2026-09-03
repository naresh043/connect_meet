import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { createSocket } from "../socket/socket";
import SOCKET_EVENTS from "../socket/socketEvents";

const useWebRTC = (meetingId) => {
  /*
  =====================================================
  CURRENT USER
  =====================================================
  */

  const authUser = useSelector((state) => state.auth?.user);

  const currentUser = {
    id: authUser?._id || authUser?.id || null,
    name: authUser?.name || "Guest",
    email: authUser?.email || "",
  };

  /*
  =====================================================
  STATE
  =====================================================
  */

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [remoteUsers, setRemoteUsers] = useState({});

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  /*
  =====================================================
  REFS
  =====================================================
  */

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  const peerConnectionsRef = useRef({});
  const pendingCandidatesRef = useRef({});

  const meetingStartedRef = useRef(false);

  const currentUserRef = useRef(currentUser);

  /*
  =====================================================
  UPDATE CURRENT USER REF
  =====================================================
  */

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [authUser?._id, authUser?.id, authUser?.name, authUser?.email]);

  /*
  =====================================================
  ADD PENDING ICE CANDIDATES
  =====================================================
  */

  const addPendingCandidates = useCallback(
    async (remoteSocketId, peerConnection) => {
      const candidates = pendingCandidatesRef.current[remoteSocketId];

      if (!candidates || candidates.length === 0) {
        return;
      }

      console.log(
        "🧊 Adding pending ICE candidates:",
        remoteSocketId,
        candidates.length,
      );

      for (const candidate of candidates) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("❌ Pending ICE candidate error:", error);
        }
      }

      delete pendingCandidatesRef.current[remoteSocketId];
    },
    [],
  );

  /*
  =====================================================
  REMOVE PEER
  =====================================================
  */

  const removePeer = useCallback((socketId) => {
    console.log("🗑️ Removing peer:", socketId);

    const peerConnection = peerConnectionsRef.current[socketId];

    if (peerConnection) {
      try {
        peerConnection.close();
      } catch (error) {
        console.error("Peer close error:", error);
      }

      delete peerConnectionsRef.current[socketId];
    }

    delete pendingCandidatesRef.current[socketId];

    setRemoteStreams((previous) => {
      const updated = { ...previous };
      delete updated[socketId];
      return updated;
    });

    setRemoteUsers((previous) => {
      const updated = { ...previous };
      delete updated[socketId];
      return updated;
    });
  }, []);

  /*
  =====================================================
  CREATE OFFER
  =====================================================
  */

  const createOffer = useCallback(async (remoteSocketId, peerConnection) => {
    try {
      if (peerConnection.signalingState !== "stable") {
        console.log(
          "⚠️ Cannot create offer. State:",
          peerConnection.signalingState,
        );

        return;
      }

      const socket = socketRef.current;

      if (!socket || !socket.connected) {
        console.warn("⚠️ Socket not connected. Offer not sent.");

        return;
      }

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      socket.emit(SOCKET_EVENTS.OFFER, {
        targetSocketId: remoteSocketId,
        offer: peerConnection.localDescription,
      });

      console.log("📡 Offer sent to:", remoteSocketId);
    } catch (error) {
      console.error("❌ Create offer error:", error);
    }
  }, []);

  /*
  =====================================================
  CREATE PEER CONNECTION
  =====================================================
  */

  const createPeerConnection = useCallback(
    (remoteSocketId, shouldCreateOffer = false) => {
      if (peerConnectionsRef.current[remoteSocketId]) {
        return peerConnectionsRef.current[remoteSocketId];
      }

      console.log("🔗 Creating peer connection:", remoteSocketId);

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      peerConnectionsRef.current[remoteSocketId] = peerConnection;

      /*
      =============================================
      LOCAL TRACKS
      =============================================
      */

      const stream = localStreamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        console.log("🎥 Local tracks added:", stream.getTracks().length);
      }

      /*
      =============================================
      REMOTE TRACK
      =============================================
      */

      peerConnection.ontrack = (event) => {
        console.log("🎥 Remote track received:", remoteSocketId);

        const [remoteStream] = event.streams;

        if (!remoteStream) {
          return;
        }

        setRemoteStreams((previous) => ({
          ...previous,
          [remoteSocketId]: remoteStream,
        }));
      };

      /*
      =============================================
      ICE CANDIDATE
      =============================================
      */

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        const socket = socketRef.current;

        if (!socket || !socket.connected) {
          return;
        }

        socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
          targetSocketId: remoteSocketId,
          candidate: event.candidate,
        });

        console.log("🧊 Sending ICE candidate to:", remoteSocketId);
      };

      /*
      =============================================
      CONNECTION STATE
      =============================================
      */

      peerConnection.onconnectionstatechange = () => {
        console.log(
          `🔗 Peer ${remoteSocketId}:`,
          peerConnection.connectionState,
        );

        if (peerConnection.connectionState === "connected") {
          console.log("✅ WebRTC connected:", remoteSocketId);
        }

        if (
          peerConnection.connectionState === "failed" ||
          peerConnection.connectionState === "closed"
        ) {
          removePeer(remoteSocketId);
        }
      };

      /*
      =============================================
      ICE CONNECTION STATE
      =============================================
      */

      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          `🧊 ICE ${remoteSocketId}:`,
          peerConnection.iceConnectionState,
        );
      };

      /*
      =============================================
      CREATE OFFER
      =============================================
      */

      if (shouldCreateOffer) {
        createOffer(remoteSocketId, peerConnection);
      }

      return peerConnection;
    },
    [createOffer, removePeer],
  );

  /*
  =====================================================
  HANDLE OFFER
  =====================================================
  */

  const handleOffer = useCallback(
    async ({ senderSocketId, senderUser, offer }) => {
      try {
        console.log("📡 Offer received from:", senderSocketId);

        if (senderUser) {
          setRemoteUsers((previous) => ({
            ...previous,
            [senderSocketId]: {
              ...senderUser,
              isMuted: senderUser.isMuted ?? false,
              isCameraOff: senderUser.isCameraOff ?? false,
            },
          }));
        }

        let peerConnection = peerConnectionsRef.current[senderSocketId];

        if (!peerConnection) {
          peerConnection = createPeerConnection(senderSocketId, false);
        }

        if (peerConnection.signalingState !== "stable") {
          console.warn(
            "⚠️ Ignoring offer. Current state:",
            peerConnection.signalingState,
          );

          return;
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        await addPendingCandidates(senderSocketId, peerConnection);

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        if (socketRef.current?.connected) {
          socketRef.current.emit(SOCKET_EVENTS.ANSWER, {
            targetSocketId: senderSocketId,
            answer: peerConnection.localDescription,
          });

          console.log("📡 Answer sent to:", senderSocketId);
        }
      } catch (error) {
        console.error("❌ Handle offer error:", error);
      }
    },
    [addPendingCandidates, createPeerConnection],
  );

  /*
  =====================================================
  HANDLE ANSWER
  =====================================================
  */

  const handleAnswer = useCallback(
    async ({ senderSocketId, senderUser, answer }) => {
      try {
        console.log("📡 Answer received from:", senderSocketId);

        if (senderUser) {
          setRemoteUsers((previous) => ({
            ...previous,
            [senderSocketId]: {
              ...senderUser,
              isMuted: senderUser.isMuted ?? false,
              isCameraOff: senderUser.isCameraOff ?? false,
            },
          }));
        }

        const peerConnection = peerConnectionsRef.current[senderSocketId];

        if (!peerConnection) {
          console.warn("⚠️ Peer connection not found:", senderSocketId);

          return;
        }

        if (peerConnection.signalingState !== "have-local-offer") {
          console.warn(
            "⚠️ Ignoring answer. Current state:",
            peerConnection.signalingState,
          );

          return;
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        await addPendingCandidates(senderSocketId, peerConnection);

        console.log("✅ Remote answer applied:", senderSocketId);
      } catch (error) {
        console.error("❌ Handle answer error:", error);
      }
    },
    [addPendingCandidates],
  );

  /*
  =====================================================
  HANDLE ICE CANDIDATE
  =====================================================
  */

  const handleIceCandidate = useCallback(
    async ({ senderSocketId, candidate }) => {
      try {
        if (!candidate) {
          return;
        }

        const peerConnection = peerConnectionsRef.current[senderSocketId];

        if (!peerConnection) {
          if (!pendingCandidatesRef.current[senderSocketId]) {
            pendingCandidatesRef.current[senderSocketId] = [];
          }

          pendingCandidatesRef.current[senderSocketId].push(candidate);

          console.log("🧊 ICE candidate waiting for peer:", senderSocketId);

          return;
        }

        if (!peerConnection.remoteDescription) {
          if (!pendingCandidatesRef.current[senderSocketId]) {
            pendingCandidatesRef.current[senderSocketId] = [];
          }

          pendingCandidatesRef.current[senderSocketId].push(candidate);

          console.log(
            "🧊 ICE candidate waiting for remote description:",
            senderSocketId,
          );

          return;
        }

        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

        console.log("✅ ICE candidate added:", senderSocketId);
      } catch (error) {
        console.error("❌ ICE error:", error);
      }
    },
    [],
  );

  /*
  =====================================================
  HANDLER REFS
  =====================================================
  */

  const handleOfferRef = useRef(handleOffer);
  const handleAnswerRef = useRef(handleAnswer);
  const handleIceCandidateRef = useRef(handleIceCandidate);
  const createPeerConnectionRef = useRef(createPeerConnection);
  const removePeerRef = useRef(removePeer);

  useEffect(() => {
    handleOfferRef.current = handleOffer;
    handleAnswerRef.current = handleAnswer;
    handleIceCandidateRef.current = handleIceCandidate;
    createPeerConnectionRef.current = createPeerConnection;
    removePeerRef.current = removePeer;
  }, [
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    createPeerConnection,
    removePeer,
  ]);

  /*
  =====================================================
  TOGGLE MICROPHONE
  =====================================================
  */

  const toggleMicrophone = useCallback(() => {
    const stream = localStreamRef.current;
    const socket = socketRef.current;

    if (!stream) {
      console.warn("⚠️ Local stream not available");
      return;
    }

    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length === 0) {
      console.warn("⚠️ No microphone track found");
      return;
    }

    /*
  =====================================================
  CURRENT MICROPHONE STATE
  =====================================================
  */

    const currentlyEnabled = audioTracks[0].enabled;

    /*
  If microphone is currently ON:
      true → MUTE

  If microphone is currently OFF:
      false → UNMUTE
  */

    const nextMuted = currentlyEnabled;

    /*
  =====================================================
  CHANGE MICROPHONE
  =====================================================
  */

    audioTracks.forEach((track) => {
      track.enabled = !nextMuted;
    });

    /*
  =====================================================
  UPDATE LOCAL STATE
  =====================================================
  */

    setIsMuted(nextMuted);

    /*
  =====================================================
  SEND STATUS TO REMOTE USERS
  =====================================================
  */

    if (socket && socket.connected && meetingId) {
      socket.emit("mic-toggle", {
        meetingId,
        isMuted: nextMuted,
      });
    }

    console.log("🎤 Local mic status:", nextMuted ? "MUTED" : "UNMUTED");
  }, [meetingId]);

  /*
  =====================================================
  TOGGLE CAMERA
  =====================================================
  */

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    const socket = socketRef.current;

    if (!stream) {
      console.warn("⚠️ Local stream not available");
      return;
    }

    const videoTracks = stream.getVideoTracks();

    if (videoTracks.length === 0) {
      console.warn("⚠️ No camera track found");
      return;
    }

    /*
  =====================================================
  CURRENT CAMERA STATE
  =====================================================
  */

    const currentlyEnabled = videoTracks[0].enabled;

    /*
  If camera is currently ON:
      true → CAMERA OFF

  If camera is currently OFF:
      false → CAMERA ON
  */

    const nextCameraOff = currentlyEnabled;

    /*
  =====================================================
  CHANGE CAMERA
  =====================================================
  */

    videoTracks.forEach((track) => {
      track.enabled = !nextCameraOff;
    });

    /*
  =====================================================
  UPDATE LOCAL STATE
  =====================================================
  */

    setIsCameraOff(nextCameraOff);

    /*
  =====================================================
  SEND STATUS TO REMOTE USERS
  =====================================================
  */

    if (socket && socket.connected && meetingId) {
      socket.emit("camera-toggle", {
        meetingId,
        isCameraOff: nextCameraOff,
      });
    }

    console.log("📹 Local camera status:", nextCameraOff ? "OFF" : "ON");
  }, [meetingId]);

  /*
  =====================================================
  LEAVE MEETING
  =====================================================
  */

  const leaveMeeting = useCallback(() => {
    console.log("🚪 Leaving meeting:", meetingId);

    const socket = socketRef.current;

    if (socket) {
      try {
        if (socket.connected) {
          socket.emit(SOCKET_EVENTS.LEAVE_ROOM, meetingId);
        }
      } catch (error) {
        console.error("Leave room error:", error);
      }

      socket.removeAllListeners();
      socket.disconnect();

      socketRef.current = null;
    }

    Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
      try {
        peerConnection.close();
      } catch (error) {
        console.error("Peer cleanup error:", error);
      }
    });

    peerConnectionsRef.current = {};
    pendingCandidatesRef.current = {};

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStreams({});
    setRemoteUsers({});
    setIsConnected(false);

    meetingStartedRef.current = false;
  }, [meetingId]);

  /*
  =====================================================
  START MEETING
  =====================================================
  */

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    if (meetingStartedRef.current) {
      console.log("⚠️ Meeting already started:", meetingId);

      return;
    }

    meetingStartedRef.current = true;

    let isMounted = true;
    let socket = null;
    let stream = null;

    const startMeeting = async () => {
      try {
        /*
        ===========================================
        CAMERA + MICROPHONE
        ===========================================
        */

        console.log("🎥 Requesting camera and microphone...");

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());

          return;
        }

        localStreamRef.current = stream;

        setLocalStream(stream);

        console.log("✅ Camera and microphone ready");

        /*
        ===========================================
        CREATE SOCKET
        ===========================================
        */

        socket = createSocket();

        socketRef.current = socket;

        console.log("🔌 Socket created for meeting:", meetingId);

        /*
        ===========================================
        CONNECT
        ===========================================
        */

        socket.on("connect", () => {
          if (!isMounted) {
            return;
          }

          if (socketRef.current !== socket) {
            return;
          }

          console.log("🔌 Socket connected:", socket.id);

          setIsConnected(true);

          /*
          JOIN ROOM
          */

          socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
            meetingId,
            user: {
              ...currentUserRef.current,
              isMuted: false,
              isCameraOff: false,
            },
          });

          console.log("🚪 Joined meeting:", meetingId);
        });

        /*
        ===========================================
        EXISTING USERS
        ===========================================
        */

        socket.on(SOCKET_EVENTS.EXISTING_USERS, ({ users }) => {
          if (!isMounted) {
            return;
          }

          console.log("👥 Existing users:", users);

          if (!Array.isArray(users)) {
            return;
          }

          users.forEach((participant) => {
            const remoteSocketId = participant.socketId;

            const remoteUser = participant.user;

            if (!remoteSocketId || remoteSocketId === socket.id) {
              return;
            }

            setRemoteUsers((previous) => ({
              ...previous,

              [remoteSocketId]: {
                ...(remoteUser || {
                  name: "Participant",
                }),

                isMuted: remoteUser?.isMuted ?? false,

                isCameraOff: remoteUser?.isCameraOff ?? false,
              },
            }));

            createPeerConnectionRef.current(remoteSocketId, true);
          });
        });

        /*
        ===========================================
        USER JOINED
        ===========================================
        */

        socket.on(SOCKET_EVENTS.USER_JOINED, ({ socketId, user }) => {
          if (!isMounted) {
            return;
          }

          if (!socketId || socketId === socket.id) {
            return;
          }

          console.log("👤 User joined:", socketId, user);

          setRemoteUsers((previous) => ({
            ...previous,

            [socketId]: {
              ...(user || {
                name: "Participant",
              }),

              isMuted: user?.isMuted ?? false,

              isCameraOff: user?.isCameraOff ?? false,
            },
          }));

          createPeerConnectionRef.current(socketId, false);
        });

        /*
        ===========================================
        REMOTE CAMERA STATUS
        ===========================================
        */

        socket.on("camera-toggle", ({ socketId, isCameraOff }) => {
          if (!isMounted) {
            return;
          }

          console.log("📹 Remote camera status:", socketId, isCameraOff);

          setRemoteUsers((previous) => {
            if (!previous[socketId]) {
              return previous;
            }

            return {
              ...previous,

              [socketId]: {
                ...previous[socketId],
                isCameraOff: Boolean(isCameraOff),
              },
            };
          });
        });

        /*
        ===========================================
        REMOTE MIC STATUS
        ===========================================
        */

        socket.on("mic-toggle", ({ socketId, isMuted }) => {
          if (!isMounted) {
            return;
          }

          console.log("🎤 Remote mic status:", socketId, isMuted);

          setRemoteUsers((previous) => {
            if (!previous[socketId]) {
              return previous;
            }

            return {
              ...previous,

              [socketId]: {
                ...previous[socketId],
                isMuted: Boolean(isMuted),
              },
            };
          });
        });

        /*
        ===========================================
        OFFER
        ===========================================
        */

        socket.on(SOCKET_EVENTS.OFFER, (data) => {
          handleOfferRef.current(data);
        });

        /*
        ===========================================
        ANSWER
        ===========================================
        */

        socket.on(SOCKET_EVENTS.ANSWER, (data) => {
          handleAnswerRef.current(data);
        });

        /*
        ===========================================
        ICE
        ===========================================
        */

        socket.on(SOCKET_EVENTS.ICE_CANDIDATE, (data) => {
          handleIceCandidateRef.current(data);
        });

        /*
        ===========================================
        USER LEFT
        ===========================================
        */

        socket.on(SOCKET_EVENTS.USER_LEFT, ({ socketId }) => {
          if (!socketId) {
            return;
          }

          console.log("👋 User left:", socketId);

          removePeerRef.current(socketId);
        });

        /*
        ===========================================
        DISCONNECT
        ===========================================
        */

        socket.on("disconnect", (reason) => {
          console.log("❌ Socket disconnected:", reason);

          if (socketRef.current === socket) {
            setIsConnected(false);
          }
        });

        /*
        ===========================================
        CONNECTION ERROR
        ===========================================
        */

        socket.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error.message);
        });

        /*
        ===========================================
        CONNECT
        ===========================================
        */

        socket.connect();
      } catch (error) {
        console.error("❌ Camera/Microphone error:", error);

        meetingStartedRef.current = false;

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    };

    startMeeting();

    /*
    =================================================
    CLEANUP
    =================================================
    */

    return () => {
      isMounted = false;

      console.log("🧹 Cleaning up WebRTC:", meetingId);

      const currentSocket = socketRef.current;

      if (currentSocket && currentSocket === socket) {
        try {
          if (currentSocket.connected) {
            currentSocket.emit(SOCKET_EVENTS.LEAVE_ROOM, meetingId);
          }
        } catch (error) {
          console.error("Cleanup leave error:", error);
        }

        currentSocket.removeAllListeners();
        currentSocket.disconnect();

        socketRef.current = null;
      }

      Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
        try {
          peerConnection.close();
        } catch (error) {
          console.error("Peer cleanup error:", error);
        }
      });

      peerConnectionsRef.current = {};
      pendingCandidatesRef.current = {};

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        localStreamRef.current = null;
      }

      setLocalStream(null);
      setRemoteStreams({});
      setRemoteUsers({});
      setIsConnected(false);

      meetingStartedRef.current = false;
    };
  }, [meetingId]);

  /*
  =====================================================
  RETURN
  =====================================================
  */

  return {
    localStream,
    remoteStreams,
    remoteUsers,

    currentUser,

    isMuted,
    isCameraOff,
    isConnected,

    toggleMicrophone,
    toggleCamera,
    leaveMeeting,
  };
};

export default useWebRTC;
