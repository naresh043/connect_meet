import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useWebRTC from "../hooks/useWebRTC";
import useMeetingTimer from "../hooks/useMeetingTimer";

import PreJoinMeeting from "../components/meeting/PreJoinMeeting";

import MeetingHeader from "../components/meeting/MeetingHeader";
import ParticipantPanel from "../components/meeting/ParticipantPanel";
import VideoGrid from "../components/meeting/VideoGrid";
import MeetingControls from "../components/meeting/MeetingControls";

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [hasJoined, setHasJoined] = useState(false);

  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("connectmeet_user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const handleJoin = () => {
    setHasJoined(true);
  };

  if (!hasJoined) {
    return (
      <PreJoinMeeting
        meetingId={meetingId}
        currentUser={currentUser}
        onJoin={handleJoin}
      />
    );
  }

  return (
    <MeetingRoom
      meetingId={meetingId}
      currentUser={currentUser}
      navigate={navigate}
    />
  );
};

/* =====================================================
   ACTUAL MEETING ROOM
===================================================== */

const MeetingRoom = ({ meetingId, currentUser, navigate }) => {
  const [showParticipants, setShowParticipants] = useState(false);

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
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-slate-950
        text-white
      "
    >
      {/* HEADER */}
      <MeetingHeader
        meetingId={meetingId}
        participantCount={participantCount}
        isConnected={isConnected}
        meetingTime={meetingTime}
        onParticipants={() => setShowParticipants((previous) => !previous)}
      />

      {/* PARTICIPANTS */}
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

      {/* VIDEO GRID */}
      <VideoGrid
        currentUser={currentUser}
        localStream={localStream}
        remoteStreams={remoteStreams}
        remoteUsers={remoteUsers}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        meetingId={meetingId}
      />

      {/* CONTROLS */}
      <MeetingControls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMic={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onLeave={handleLeave}
        onParticipants={() => setShowParticipants((previous) => !previous)}
      />
    </div>
  );
};

export default Meeting;
