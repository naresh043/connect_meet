import { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import useWebRTC from "../hooks/useWebRTC";

import VideoTile from "../components/meeting/VideoTile";

import MeetingControls from "../components/meeting/MeetingControls";

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("connectmeet_user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("❌ Failed to read stored user:", error);

      return null;
    }
  });

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

      <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">ConnectMeet</h1>

          <p className="text-xs text-gray-400">Meeting ID: {meetingId}</p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />

          <span className="text-sm text-gray-400">
            {isConnected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </header>

      {/* =====================================================
          VIDEO AREA
          ===================================================== */}

      <main className="p-6 pb-32">
        <div
          className={`grid gap-5 ${
            Object.keys(remoteStreams).length === 0
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {/* =====================================================
              LOCAL VIDEO
              ===================================================== */}

          {localStream && (
            <VideoTile
              stream={localStream}
              name={currentUser?.name || "You"}
              muted={true}
              isLocal={true}
            />
          )}

          {/* =====================================================
              REMOTE VIDEOS
              ===================================================== */}

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

            <div className="inline-block mt-2 bg-gray-800 px-4 py-2 rounded-lg font-mono">
              {meetingId}
            </div>
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
