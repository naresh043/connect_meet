import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useWebRTC from "../hooks/useWebRTC";
import useMeetingTimer from "../hooks/useMeetingTimer";

import MeetingHeader from "../components/meeting/MeetingHeader";
import ParticipantPanel from "../components/meeting/ParticipantPanel";
import VideoGrid from "../components/meeting/VideoGrid";
import MeetingControls from "../components/meeting/MeetingControls";

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [showParticipants, setShowParticipants] = useState(false);

  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("connectmeet_user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
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

  const meetingTime = useMeetingTimer();

  const participantCount = 1 + Object.keys(remoteUsers || {}).length;

  const handleLeave = () => {
    leaveMeeting();
    navigate("/dashboard");
  };

  useEffect(() => {
    return () => {
      leaveMeeting();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <MeetingHeader
        meetingId={meetingId}
        currentUser={currentUser}
        participantCount={participantCount}
        isConnected={isConnected}
        meetingTime={meetingTime}
        onParticipants={() => setShowParticipants((prev) => !prev)}
      />

      {showParticipants && (
        <ParticipantPanel
          currentUser={currentUser}
          remoteUsers={remoteUsers}
          remoteStreams={remoteStreams}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onClose={() => setShowParticipants(false)}
        />
      )}

      <VideoGrid
        currentUser={currentUser}
        localStream={localStream}
        remoteStreams={remoteStreams}
        remoteUsers={remoteUsers}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        meetingId={meetingId}
      />

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
