import { useCallback, useEffect, useRef, useState } from "react";

import { createSocket } from "../socket/socket";
import SOCKET_EVENTS from "../socket/socketEvents";

const useWebRTC = (meetingId) => {
  /*
  =====================================================
  STATE
  =====================================================
  */

  const [localStream, setLocalStream] = useState(null);

  const [remoteStreams, setRemoteStreams] = useState({});

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
    const peerConnection = peerConnectionsRef.current[socketId];

    if (peerConnection) {
      peerConnection.close();

      delete peerConnectionsRef.current[socketId];
    }

    delete pendingCandidatesRef.current[socketId];

    setRemoteStreams((previous) => {
      const updated = {
        ...previous,
      };

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
      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      if (!socketRef.current) {
        return;
      }

      socketRef.current.emit(SOCKET_EVENTS.OFFER, {
        targetSocketId: remoteSocketId,
        offer,
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
      /*
      Prevent duplicate peer connections
      */

      if (peerConnectionsRef.current[remoteSocketId]) {
        return peerConnectionsRef.current[remoteSocketId];
      }

      console.log("🔗 Creating peer connection:", remoteSocketId);

      /*
      Create RTCPeerConnection
      */

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      /*
      Store peer connection
      */

      peerConnectionsRef.current[remoteSocketId] = peerConnection;

      /*
      =================================================
      ADD LOCAL AUDIO + VIDEO TRACKS
      =================================================
      */

      const stream = localStreamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        console.log("🎥 Local tracks added:", stream.getTracks().length);
      } else {
        console.warn("⚠️ Local stream is not available");
      }

      /*
      =================================================
      RECEIVE REMOTE STREAM
      =================================================
      */

      peerConnection.ontrack = (event) => {
        console.log("🎥 Remote track received from:", remoteSocketId);

        const [remoteStream] = event.streams;

        if (!remoteStream) {
          console.warn("⚠️ No remote stream received");

          return;
        }

        setRemoteStreams((previous) => ({
          ...previous,

          [remoteSocketId]: remoteStream,
        }));
      };

      /*
      =================================================
      ICE CANDIDATE
      =================================================
      */

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          console.log("🧊 Sending ICE candidate to:", remoteSocketId);

          socketRef.current.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
            targetSocketId: remoteSocketId,

            candidate: event.candidate,
          });
        }
      };

      /*
      =================================================
      CONNECTION STATE
      =================================================
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
          peerConnection.connectionState === "closed" ||
          peerConnection.connectionState === "disconnected"
        ) {
          removePeer(remoteSocketId);
        }
      };

      /*
      =================================================
      CREATE OFFER IF REQUIRED
      =================================================
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
    async ({ senderSocketId, offer }) => {
      try {
        console.log("📡 Offer received from:", senderSocketId);

        const peerConnection = createPeerConnection(senderSocketId, false);

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        /*
        Add ICE candidates that arrived
        before remote description
        */

        await addPendingCandidates(senderSocketId, peerConnection);

        /*
        Create answer
        */

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        /*
        Send answer
        */

        if (socketRef.current) {
          socketRef.current.emit(SOCKET_EVENTS.ANSWER, {
            targetSocketId: senderSocketId,

            answer,
          });
        }

        console.log("📡 Answer sent to:", senderSocketId);
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
    async ({ senderSocketId, answer }) => {
      try {
        console.log("📡 Answer received from:", senderSocketId);

        const peerConnection = peerConnectionsRef.current[senderSocketId];

        if (!peerConnection) {
          console.warn("⚠️ Peer connection not found:", senderSocketId);

          return;
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        /*
        Add pending ICE candidates
        */

        await addPendingCandidates(senderSocketId, peerConnection);

        console.log("✅ Remote answer applied");
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
        console.log("🧊 ICE candidate received from:", senderSocketId);

        if (!candidate) {
          return;
        }

        const peerConnection = peerConnectionsRef.current[senderSocketId];

        /*
        Peer connection doesn't exist yet
        */

        if (!peerConnection) {
          if (!pendingCandidatesRef.current[senderSocketId]) {
            pendingCandidatesRef.current[senderSocketId] = [];
          }

          pendingCandidatesRef.current[senderSocketId].push(candidate);

          console.log("🧊 ICE candidate stored for later");

          return;
        }

        /*
        Remote description isn't ready
        */

        if (!peerConnection.remoteDescription) {
          if (!pendingCandidatesRef.current[senderSocketId]) {
            pendingCandidatesRef.current[senderSocketId] = [];
          }

          pendingCandidatesRef.current[senderSocketId].push(candidate);

          console.log("🧊 ICE candidate waiting for remote description");

          return;
        }

        /*
        Add ICE candidate
        */

        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

        console.log("✅ ICE candidate added");
      } catch (error) {
        console.error("❌ ICE candidate error:", error);
      }
    },
    [],
  );

  /*
  =====================================================
  TOGGLE MICROPHONE
  =====================================================
  */

  const toggleMicrophone = useCallback(() => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((previous) => !previous);
  }, []);

  /*
  =====================================================
  TOGGLE CAMERA
  =====================================================
  */

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff((previous) => !previous);
  }, []);

  /*
  =====================================================
  LEAVE MEETING
  =====================================================
  */

  const leaveMeeting = useCallback(() => {
    console.log("🚪 Leaving meeting:", meetingId);

    /*
    Tell server
    */

    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, meetingId);

      socketRef.current.disconnect();

      socketRef.current = null;
    }

    /*
    Close all peer connections
    */

    Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
      peerConnection.close();
    });

    peerConnectionsRef.current = {};

    /*
    Clear pending candidates
    */

    pendingCandidatesRef.current = {};

    /*
    Stop camera and microphone
    */

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStreamRef.current = null;
    }

    setLocalStream(null);

    setRemoteStreams({});

    setIsConnected(false);
    setIsMuted(false);
    setIsCameraOff(false);
  }, [meetingId]);

  /*
  =====================================================
  MAIN WEBRTC EFFECT
  =====================================================
  */

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    let isMounted = true;

    const startMeeting = async () => {
      try {
        console.log("🎥 Requesting camera and microphone...");

        /*
        =================================================
        GET CAMERA + MICROPHONE
        =================================================
        */

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        /*
        Component unmounted while permission
        request was running
        */

        if (!isMounted) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });

          return;
        }

        /*
        Save stream in BOTH state and ref
        */

        localStreamRef.current = stream;

        setLocalStream(stream);

        console.log("✅ Camera and microphone ready");

        /*
        =================================================
        CREATE SOCKET
        =================================================
        */

        const socket = createSocket();

        socketRef.current = socket;

        /*
        =================================================
        SOCKET CONNECTED
        =================================================
        */

        socket.on("connect", () => {
          console.log("🔌 Socket connected:", socket.id);

          setIsConnected(true);

          /*
          Join meeting room
          */

          socket.emit(SOCKET_EVENTS.JOIN_ROOM, meetingId);

          console.log("🚪 Joined meeting:", meetingId);
        });

        /*
        =================================================
        EXISTING USERS
        =================================================
        */

        socket.on(SOCKET_EVENTS.EXISTING_USERS, ({ users }) => {
          console.log("👥 Existing users:", users);

          users.forEach((remoteSocketId) => {
            if (remoteSocketId !== socket.id) {
              /*
                  Existing user creates
                  the offer.
                  */

              createPeerConnection(remoteSocketId, true);
            }
          });
        });

        /*
        =================================================
        NEW USER JOINED
        =================================================
        */

        socket.on(SOCKET_EVENTS.USER_JOINED, ({ socketId }) => {
          console.log("👤 New user joined:", socketId);

          /*
            Existing user creates OFFER
            for the new user.
            */

          createPeerConnection(socketId, true);
        });

        /*
        =================================================
        OFFER
        =================================================
        */

        socket.on(SOCKET_EVENTS.OFFER, handleOffer);

        /*
        =================================================
        ANSWER
        =================================================
        */

        socket.on(SOCKET_EVENTS.ANSWER, handleAnswer);

        /*
        =================================================
        ICE CANDIDATE
        =================================================
        */

        socket.on(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidate);

        /*
        =================================================
        USER LEFT
        =================================================
        */

        socket.on(SOCKET_EVENTS.USER_LEFT, ({ socketId }) => {
          console.log("👋 User left:", socketId);

          removePeer(socketId);
        });

        /*
        =================================================
        SOCKET DISCONNECT
        =================================================
        */

        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
          console.log("❌ Socket disconnected");

          setIsConnected(false);
        });
      } catch (error) {
        console.error("❌ Camera/Microphone error:", error);
      }
    };

    startMeeting();

    /*
    =====================================================
    CLEANUP
    =====================================================
    */

    return () => {
      isMounted = false;

      console.log("🧹 Cleaning up WebRTC...");

      /*
      Leave socket room
      */

      if (socketRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, meetingId);

        socketRef.current.disconnect();

        socketRef.current = null;
      }

      /*
      Close peer connections
      */

      Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
        peerConnection.close();
      });

      peerConnectionsRef.current = {};

      /*
      Clear pending ICE
      */

      pendingCandidatesRef.current = {};

      /*
      Stop local media
      */

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        localStreamRef.current = null;
      }
    };
  }, [
    meetingId,
    createPeerConnection,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
  ]);

  /*
  =====================================================
  RETURN
  =====================================================
  */

  return {
    localStream,

    remoteStreams,

    isMuted,

    isCameraOff,

    isConnected,

    toggleMicrophone,

    toggleCamera,

    leaveMeeting,
  };
};

export default useWebRTC;
