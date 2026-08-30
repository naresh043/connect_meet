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

      console.log("🧊 Adding pending ICE candidates:", candidates.length);

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
      /*
        Prevent creating an offer if this
        connection is already negotiating.
        */

      if (peerConnection.signalingState !== "stable") {
        console.log(
          "⚠️ Cannot create offer. Signaling state:",
          peerConnection.signalingState,
        );

        return;
      }

      console.log("📡 Creating offer for:", remoteSocketId);

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      if (!socketRef.current) {
        return;
      }

      socketRef.current.emit(SOCKET_EVENTS.OFFER, {
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
      /*
      =================================================
      CHECK EXISTING CONNECTION
      =================================================
      */

      if (peerConnectionsRef.current[remoteSocketId]) {
        console.log("♻️ Peer connection already exists:", remoteSocketId);

        return peerConnectionsRef.current[remoteSocketId];
      }

      console.log("🔗 Creating peer connection:", remoteSocketId);

      /*
      =================================================
      CREATE RTCPeerConnection
      =================================================
      */

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      /*
      =================================================
      STORE CONNECTION
      =================================================
      */

      peerConnectionsRef.current[remoteSocketId] = peerConnection;

      /*
      =================================================
      ADD LOCAL TRACKS
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
      REMOTE TRACK
      =================================================
      */

      peerConnection.ontrack = (event) => {
        console.log("🎥 Remote track received from:", remoteSocketId);

        const [remoteStream] = event.streams;

        if (!remoteStream) {
          console.warn("⚠️ Remote stream not available");

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
        if (!event.candidate || !socketRef.current) {
          return;
        }

        console.log("🧊 Sending ICE candidate to:", remoteSocketId);

        socketRef.current.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
          targetSocketId: remoteSocketId,

          candidate: event.candidate,
        });
      };

      /*
      =================================================
      ICE CONNECTION STATE
      =================================================
      */

      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          `🧊 ICE state ${remoteSocketId}:`,
          peerConnection.iceConnectionState,
        );
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
      CREATE OFFER ONLY WHEN REQUESTED
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

        /*
        Get existing connection or create one.
        */

        let peerConnection = peerConnectionsRef.current[senderSocketId];

        if (!peerConnection) {
          peerConnection = createPeerConnection(senderSocketId, false);
        }

        /*
        =================================================
        IMPORTANT:
        Set remote description BEFORE answer.
        =================================================
        */

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        console.log("✅ Remote offer applied");

        /*
        Add pending ICE candidates
        */

        await addPendingCandidates(senderSocketId, peerConnection);

        /*
        =================================================
        CREATE ANSWER
        =================================================
        */

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        /*
        =================================================
        SEND ANSWER
        =================================================
        */

        if (socketRef.current) {
          socketRef.current.emit(SOCKET_EVENTS.ANSWER, {
            targetSocketId: senderSocketId,

            answer: peerConnection.localDescription,
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

        /*
        =================================================
        IMPORTANT:
        Answer can only be applied when we are
        waiting for an answer.
        =================================================
        */

        if (peerConnection.signalingState !== "have-local-offer") {
          console.warn(
            "⚠️ Ignoring answer because signaling state is:",
            peerConnection.signalingState,
          );

          return;
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        console.log("✅ Remote answer applied");

        /*
        Add pending ICE candidates
        */

        await addPendingCandidates(senderSocketId, peerConnection);
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

        console.log("🧊 ICE candidate received from:", senderSocketId);

        const peerConnection = peerConnectionsRef.current[senderSocketId];

        /*
        =================================================
        PEER DOES NOT EXIST YET
        =================================================
        */

        if (!peerConnection) {
          if (!pendingCandidatesRef.current[senderSocketId]) {
            pendingCandidatesRef.current[senderSocketId] = [];
          }

          pendingCandidatesRef.current[senderSocketId].push(candidate);

          console.log("🧊 ICE candidate stored");

          return;
        }

        /*
        =================================================
        REMOTE DESCRIPTION NOT READY
        =================================================
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
        =================================================
        ADD ICE CANDIDATE
        =================================================
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
    =================================================
    SOCKET
    =================================================
    */

    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, meetingId);

      socketRef.current.disconnect();

      socketRef.current = null;
    }

    /*
    =================================================
    PEER CONNECTIONS
    =================================================
    */

    Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
      peerConnection.close();
    });

    peerConnectionsRef.current = {};

    /*
    =================================================
    PENDING ICE
    =================================================
    */

    pendingCandidatesRef.current = {};

    /*
    =================================================
    MEDIA
    =================================================
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
  MAIN EFFECT
  =====================================================
  */

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    let isMounted = true;

    const startMeeting = async () => {
      try {
        /*
        =================================================
        CAMERA + MICROPHONE
        =================================================
        */

        console.log("🎥 Requesting camera and microphone...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });

          return;
        }

        localStreamRef.current = stream;

        setLocalStream(stream);

        console.log("✅ Camera and microphone ready");

        /*
        =================================================
        SOCKET
        =================================================
        */

        const socket = createSocket();

        socketRef.current = socket;

        /*
        =================================================
        CONNECT
        =================================================
        */

        socket.on("connect", () => {
          console.log("🔌 Socket connected:", socket.id);

          setIsConnected(true);

          /*
          Join meeting
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

          /*
            IMPORTANT:

            The NEW USER should create the
            connection to existing users.

            Therefore the new user creates
            the OFFER here.

            */

          users.forEach((remoteSocketId) => {
            if (remoteSocketId !== socket.id) {
              createPeerConnection(remoteSocketId, true);
            }
          });
        });

        /*
        =================================================
        USER JOINED
        =================================================
        */

        socket.on(SOCKET_EVENTS.USER_JOINED, ({ socketId }) => {
          console.log("👤 New user joined:", socketId);

          /*
            IMPORTANT:

            DO NOT create an offer here.

            The new user will receive the
            existing user's socket ID through
            existing-users and will create the
            offer.

            */

          createPeerConnection(socketId, false);
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
        ICE
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
        DISCONNECT
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
      Socket
      */

      if (socketRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, meetingId);

        socketRef.current.disconnect();

        socketRef.current = null;
      }

      /*
      Peer connections
      */

      Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
        peerConnection.close();
      });

      peerConnectionsRef.current = {};

      /*
      Pending candidates
      */

      pendingCandidatesRef.current = {};

      /*
      Media
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
