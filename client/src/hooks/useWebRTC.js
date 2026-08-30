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

    setRemoteUsers((previous) => {
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
      if (peerConnection.signalingState !== "stable") {
        console.log(
          "⚠️ Cannot create offer. State:",
          peerConnection.signalingState,
        );

        return;
      }

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
        Prevent duplicate connection
        */

      if (peerConnectionsRef.current[remoteSocketId]) {
        return peerConnectionsRef.current[remoteSocketId];
      }

      console.log("🔗 Creating peer connection:", remoteSocketId);

      /*
        Create peer
        */

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      peerConnectionsRef.current[remoteSocketId] = peerConnection;

      /*
        =================================================
        LOCAL TRACKS
        =================================================
        */

      const stream = localStreamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        console.log("🎥 Local tracks added:", stream.getTracks().length);
      }

      /*
        =================================================
        REMOTE TRACK
        =================================================
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
        =================================================
        ICE
        =================================================
        */

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate || !socketRef.current) {
          return;
        }

        socketRef.current.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
          targetSocketId: remoteSocketId,

          candidate: event.candidate,
        });
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
          peerConnection.connectionState === "closed"
        ) {
          removePeer(remoteSocketId);
        }
      };

      /*
        =================================================
        CREATE OFFER
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
    async ({ senderSocketId, senderUser, offer }) => {
      try {
        console.log("📡 Offer received from:", senderSocketId);

        /*
        Save remote user
        */

        if (senderUser) {
          setRemoteUsers((previous) => ({
            ...previous,

            [senderSocketId]: senderUser,
          }));
        }

        /*
        Get/create peer
        */

        let peerConnection = peerConnectionsRef.current[senderSocketId];

        if (!peerConnection) {
          peerConnection = createPeerConnection(senderSocketId, false);
        }

        /*
        Apply offer
        */

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        /*
        Pending ICE
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

        socketRef.current?.emit(SOCKET_EVENTS.ANSWER, {
          targetSocketId: senderSocketId,

          answer: peerConnection.localDescription,
        });

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
    async ({ senderSocketId, senderUser, answer }) => {
      try {
        console.log("📡 Answer received from:", senderSocketId);

        /*
        Save user
        */

        if (senderUser) {
          setRemoteUsers((previous) => ({
            ...previous,

            [senderSocketId]: senderUser,
          }));
        }

        const peerConnection = peerConnectionsRef.current[senderSocketId];

        if (!peerConnection) {
          return;
        }

        /*
        Prevent stable-state error
        */

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

        console.log("✅ Remote answer applied");
      } catch (error) {
        console.error("❌ Handle answer error:", error);
      }
    },
    [addPendingCandidates],
  );

  /*
  =====================================================
  HANDLE ICE
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

          return;
        }

        if (!peerConnection.remoteDescription) {
          if (!pendingCandidatesRef.current[senderSocketId]) {
            pendingCandidatesRef.current[senderSocketId] = [];
          }

          pendingCandidatesRef.current[senderSocketId].push(candidate);

          return;
        }

        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("❌ ICE error:", error);
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
      ICE
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

    setLocalStream(null);

    setRemoteStreams({});

    setRemoteUsers({});

    setIsConnected(false);
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

    let isMounted = true;

    const startMeeting = async () => {
      try {
        console.log("🎥 Requesting camera and microphone...");

        /*
          Camera
          */

        const stream = await navigator.mediaDevices.getUserMedia({
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
          Socket
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
              Send user information
              */

          socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
            meetingId,

            user: currentUser,
          });

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
              Existing user format:

              {
                socketId,
                user
              }
              */

          users.forEach((participant) => {
            const remoteSocketId = participant.socketId;

            const remoteUser = participant.user;

            if (remoteSocketId === socket.id) {
              return;
            }

            /*
                  Save user
                  */

            setRemoteUsers((previous) => ({
              ...previous,

              [remoteSocketId]: remoteUser,
            }));

            /*
                  New participant
                  creates OFFER
                  */

            createPeerConnection(remoteSocketId, true);
          });
        });

        /*
          =================================================
          USER JOINED
          =================================================
          */

        socket.on(SOCKET_EVENTS.USER_JOINED, ({ socketId, user }) => {
          console.log("👤 User joined:", socketId, user);

          /*
              Save user
              */

          setRemoteUsers((previous) => ({
            ...previous,

            [socketId]: user,
          }));

          /*
              IMPORTANT:

              Existing participant DOES NOT
              create offer.

              New participant will create
              offer from existing-users.
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

      if (socketRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, meetingId);

        socketRef.current.disconnect();

        socketRef.current = null;
      }

      Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
        peerConnection.close();
      });

      peerConnectionsRef.current = {};

      pendingCandidatesRef.current = {};

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
