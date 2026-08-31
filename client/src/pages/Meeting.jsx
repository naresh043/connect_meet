import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { Users, Clock, Copy, Check, Link } from "feather-icons-react";

import useWebRTC from "../hooks/useWebRTC";

import VideoTile from "../components/meeting/VideoTile";

import MeetingControls from "../components/meeting/MeetingControls";

const Meeting = () => {
  const { meetingId } = useParams();

  const navigate = useNavigate();

  /*
  =====================================================
  CURRENT USER
  =====================================================
  */

  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("connectmeet_user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("❌ Failed to read stored user:", error);

      return null;
    }
  });

  /*
  =====================================================
  WEBRTC
  =====================================================
  */

  const {
    localStream,
    remoteStreams,
    remoteUsers,
    isMuted,
    isCameraOff,
    isConnected,
    toggleMicrophone,
    toggleCamera,
    leaveMeeting,
  } = useWebRTC(meetingId);

  /*
  =====================================================
  TIMER
  =====================================================
  */

  const [meetingSeconds, setMeetingSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingSeconds((previous) => previous + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /*
  =====================================================
  FORMAT TIMER
  =====================================================
  */

  const formatMeetingTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  /*
  =====================================================
  PARTICIPANT COUNT
  =====================================================
  */

  const participantCount = 1 + Object.keys(remoteStreams).length;

  /*
  =====================================================
  COPY STATE
  =====================================================
  */

  const [copiedType, setCopiedType] = useState(null);

  /*
  =====================================================
  COPY TEXT
  =====================================================
  */

  const copyText = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedType(type);

      setTimeout(() => {
        setCopiedType(null);
      }, 2000);
    } catch (error) {
      console.error("❌ Copy failed:", error);
    }
  };

  /*
  =====================================================
  COPY MEETING ID
  =====================================================
  */

  const handleCopyMeetingId = () => {
    copyText(meetingId, "id");
  };

  /*
  =====================================================
  COPY MEETING LINK
  =====================================================
  */

  const handleCopyMeetingLink = () => {
    const meetingLink = `${window.location.origin}/meeting/${meetingId}`;

    copyText(meetingLink, "link");
  };

  /*
  =====================================================
  LEAVE MEETING
  =====================================================
  */

  const handleLeave = () => {
    leaveMeeting();

    navigate("/dashboard");
  };

  /*
  =====================================================
  PAGE CLEANUP
  =====================================================
  */

  useEffect(() => {
    return () => {
      leaveMeeting();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  =====================================================
  DEBUG
  =====================================================
  */

  console.log("👥 Remote Users:", remoteUsers);

  console.log("🎥 Remote Streams:", remoteStreams);

  /*
  =====================================================
  UI
  =====================================================
  */

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="min-h-16 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* =================================================
              LEFT SIDE
              ================================================= */}

          <div className="flex items-center gap-4">
            {/* LOGO */}

            <div>
              <h1 className="font-bold text-lg sm:text-xl">ConnectMeet</h1>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Meeting ID:</span>

                <span className="font-mono text-gray-300">{meetingId}</span>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
              ================================================= */}

          <div className="flex flex-wrap items-center gap-2">
            {/* CONNECTION STATUS */}

            <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />

              <span className="text-xs sm:text-sm text-gray-300">
                {isConnected ? "Connected" : "Connecting..."}
              </span>
            </div>

            {/* PARTICIPANTS */}

            <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
              <Users size={16} />

              <span className="text-xs sm:text-sm">{participantCount}</span>
            </div>

            {/* TIMER */}

            <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
              <Clock size={16} />

              <span className="font-mono text-xs sm:text-sm">
                {formatMeetingTime(meetingSeconds)}
              </span>
            </div>

            {/* COPY ID */}

            <button
              type="button"
              onClick={handleCopyMeetingId}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 transition px-3 py-2 rounded-lg text-xs sm:text-sm"
              title="Copy Meeting ID"
            >
              {copiedType === "id" ? (
                <>
                  <Check size={16} className="text-green-400" />

                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} />

                  <span className="hidden sm:inline">Copy ID</span>
                </>
              )}
            </button>

            {/* COPY LINK */}

            <button
              type="button"
              onClick={handleCopyMeetingLink}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-3 py-2 rounded-lg text-xs sm:text-sm"
              title="Copy Meeting Link"
            >
              {copiedType === "link" ? (
                <>
                  <Check size={16} />

                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Link size={16} />

                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          VIDEO AREA
          ===================================================== */}

      <main className="p-4 sm:p-6 pb-32">
        <div
          className={`grid gap-5 ${
            Object.keys(remoteStreams).length === 0
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {/* =================================================
              LOCAL VIDEO
              ================================================= */}

          {localStream && (
            <VideoTile
              stream={localStream}
              name={currentUser?.name || "You"}
              muted={true}
              isLocal={true}
            />
          )}

          {/* =================================================
              REMOTE VIDEOS
              ================================================= */}

          {Object.entries(remoteStreams).map(([socketId, stream]) => {
            const participant = remoteUsers?.[socketId];

            const participantName = participant?.name || "Participant";

            return (
              <VideoTile
                key={socketId}
                stream={stream}
                name={participantName}
                muted={false}
                isLocal={false}
              />
            );
          })}
        </div>

        {/* =====================================================
            WAITING MESSAGE
            ===================================================== */}

        {Object.keys(remoteStreams).length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-400">Waiting for another participant...</p>

            <p className="text-gray-600 text-sm mt-2">Share this Meeting ID:</p>

            <button
              type="button"
              onClick={handleCopyMeetingId}
              className="inline-flex items-center gap-2 mt-2 bg-gray-800 hover:bg-gray-700 transition px-4 py-2 rounded-lg font-mono"
            >
              {meetingId}

              {copiedType === "id" ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
      </main>

      {/* =====================================================
          MEETING CONTROLS
          ===================================================== */}

      <MeetingControls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMic={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onLeave={handleLeave}
      />
    </div>
  );
};

export default Meeting;
