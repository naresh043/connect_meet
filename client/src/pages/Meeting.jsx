import {
  AlertTriangle,
  CheckCircle2,
  Home,
  Loader2,
  PhoneOff,
  RotateCcw,
  Wifi,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import useWebRTC from "../hooks/useWebRTC";
import useMeetingTimer from "../hooks/useMeetingTimer";

import PreJoinMeeting from "../components/meeting/PreJoinMeeting";
import MeetingHeader from "../components/meeting/MeetingHeader";
import ParticipantPanel from "../components/meeting/ParticipantPanel";
import VideoGrid from "../components/meeting/VideoGrid";
import MeetingControls from "../components/meeting/MeetingControls";

/*
 * =====================================================
 * MAIN MEETING PAGE
 * =====================================================
 */

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [hasJoined, setHasJoined] = useState(false);

  /*
   * Get current user only once.
   */
  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("connectmeet_user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to load current user:", error);

      return null;
    }
  });

  /*
   * =====================================================
   * JOIN MEETING
   * =====================================================
   */

  const handleJoin = useCallback(() => {
    setHasJoined(true);
  }, []);

  /*
   * =====================================================
   * PRE-JOIN SCREEN
   * =====================================================
   */

  if (!hasJoined) {
    return (
      <PreJoinMeeting
        meetingId={meetingId}
        currentUser={currentUser}
        onJoin={handleJoin}
      />
    );
  }

  /*
   * =====================================================
   * ACTUAL MEETING ROOM
   * =====================================================
   */

  return (
    <MeetingRoom
      meetingId={meetingId}
      currentUser={currentUser}
      navigate={navigate}
    />
  );
};

/*
 * =====================================================
 * ACTUAL MEETING ROOM
 * =====================================================
 */

const MeetingRoom = ({ meetingId, currentUser, navigate }) => {
  const [showParticipants, setShowParticipants] = useState(false);

  /*
   * Leave confirmation state.
   */
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  /*
   * Meeting ended state.
   */
  const [meetingEnded, setMeetingEnded] = useState(false);

  /*
   * Prevent multiple leave operations.
   */
  const [isLeaving, setIsLeaving] = useState(false);

  /*
   * =====================================================
   * WEBRTC
   * =====================================================
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
   * =====================================================
   * MEETING TIMER
   * =====================================================
   */

  const meetingTime = useMeetingTimer();

  /*
   * =====================================================
   * PARTICIPANT COUNT
   * =====================================================
   */

  const participantCount = 1 + Object.keys(remoteUsers || {}).length;

  /*
   * =====================================================
   * OPEN LEAVE CONFIRMATION
   * =====================================================
   */

  const handleLeaveRequest = useCallback(() => {
    if (isLeaving || meetingEnded) {
      return;
    }

    setShowLeaveConfirmation(true);
  }, [isLeaving, meetingEnded]);

  /*
   * =====================================================
   * CANCEL LEAVE
   * =====================================================
   */

  const handleCancelLeave = useCallback(() => {
    if (isLeaving) {
      return;
    }

    setShowLeaveConfirmation(false);
  }, [isLeaving]);

  /*
   * =====================================================
   * CONFIRM LEAVE
   * =====================================================
   */

  const handleConfirmLeave = useCallback(() => {
    if (isLeaving || meetingEnded) {
      return;
    }

    setIsLeaving(true);

    /*
     * Close confirmation immediately.
     */
    setShowLeaveConfirmation(false);

    /*
     * Cleanup WebRTC/socket connection.
     */
    try {
      leaveMeeting();
    } catch (error) {
      console.error("Error while leaving meeting:", error);
    }

    /*
     * Show ended screen instead of immediately
     * navigating away.
     */
    setMeetingEnded(true);

    setIsLeaving(false);
  }, [isLeaving, meetingEnded, leaveMeeting]);

  /*
   * =====================================================
   * CLEANUP WHEN COMPONENT UNMOUNTS
   * =====================================================
   *
   * This protects against:
   *
   * - Browser back button
   * - Route navigation
   * - Component unmount
   * - Dashboard navigation
   */

  useEffect(() => {
    return () => {
      try {
        leaveMeeting();
      } catch (error) {
        console.error("Meeting cleanup error:", error);
      }
    };

    // Intentionally run cleanup only when MeetingRoom unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * =====================================================
   * RETURN TO DASHBOARD
   * =====================================================
   */

  const handleReturnDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  /*
   * =====================================================
   * REJOIN
   * =====================================================
   */

  const handleRejoin = useCallback(() => {
    /*
     * Reloading returns the user to the pre-join
     * screen and creates a fresh WebRTC session.
     */
    window.location.reload();
  }, []);

  /*
   * =====================================================
   * MEETING ENDED SCREEN
   * =====================================================
   */

  if (meetingEnded) {
    return (
      <MeetingEndedScreen
        meetingId={meetingId}
        onRejoin={handleRejoin}
        onReturnDashboard={handleReturnDashboard}
      />
    );
  }

  /*
   * =====================================================
   * CONNECTING SCREEN
   * =====================================================
   *
   * After the user clicks Join, useWebRTC starts
   * establishing the socket/WebRTC connection.
   */

  if (!isConnected) {
    return (
      <>
        <ConnectingScreen meetingId={meetingId} onLeave={handleLeaveRequest} />

        {showLeaveConfirmation && (
          <LeaveConfirmationModal
            onCancel={handleCancelLeave}
            onConfirm={handleConfirmLeave}
            isLeaving={isLeaving}
          />
        )}
      </>
    );
  }

  /*
   * =====================================================
   * CONNECTED MEETING
   * =====================================================
   */

  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-slate-950
        text-white
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <MeetingHeader
        meetingId={meetingId}
        participantCount={participantCount}
        isConnected={isConnected}
        meetingTime={meetingTime}
        onParticipants={() => setShowParticipants((previous) => !previous)}
      />

      {/* =================================================
          PARTICIPANTS
      ================================================= */}

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

      {/* =================================================
          VIDEO GRID
      ================================================= */}

      <VideoGrid
        currentUser={currentUser}
        localStream={localStream}
        remoteStreams={remoteStreams}
        remoteUsers={remoteUsers}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        meetingId={meetingId}
      />

      {/* =================================================
          CONTROLS
      ================================================= */}

      <MeetingControls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMic={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onLeave={handleLeaveRequest}
        onParticipants={() => setShowParticipants((previous) => !previous)}
      />

      {/* =================================================
          LEAVE CONFIRMATION
      ================================================= */}

      {showLeaveConfirmation && (
        <LeaveConfirmationModal
          onCancel={handleCancelLeave}
          onConfirm={handleConfirmLeave}
          isLeaving={isLeaving}
        />
      )}
    </div>
  );
};

/*
 * =====================================================
 * CONNECTING SCREEN
 * =====================================================
 */

const ConnectingScreen = ({ meetingId, onLeave }) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950
        px-4
      "
    >
      <div className="w-full max-w-md text-center">
        {/* CONNECTION ICON */}

        <div
          className="
            mx-auto
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-2xl
            border
            border-indigo-500/20
            bg-indigo-500/10
            shadow-xl
            shadow-indigo-950/20
          "
        >
          <div className="relative">
            <Wifi size={32} className="text-indigo-400" />

            <Loader2
              size={16}
              className="
                absolute
                -right-3
                -top-3
                animate-spin
                text-indigo-300
              "
            />
          </div>
        </div>

        {/* TITLE */}

        <h1
          className="
            mt-6
            text-xl
            font-semibold
            tracking-tight
            text-white
            sm:text-2xl
          "
        >
          Connecting to meeting
        </h1>

        {/* DESCRIPTION */}

        <p
          className="
            mx-auto
            mt-3
            max-w-sm
            text-sm
            leading-6
            text-slate-400
          "
        >
          Setting up your connection. This should only take a moment.
        </p>

        {/* LOADING */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
            text-xs
            text-slate-500
          "
        >
          <Loader2 size={14} className="animate-spin" />

          <span>Connecting...</span>
        </div>

        {/* MEETING ID */}

        <div
          className="
            mx-auto
            mt-6
            w-fit
            rounded-lg
            border
            border-slate-800
            bg-slate-900
            px-4
            py-2
          "
        >
          <span className="text-[10px] uppercase tracking-wider text-slate-600">
            Meeting ID
          </span>

          <p className="mt-0.5 font-mono text-xs text-slate-400">{meetingId}</p>
        </div>

        {/* LEAVE */}

        <button
          type="button"
          onClick={onLeave}
          className="
            mt-8
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-700
            bg-slate-900
            px-5
            text-sm
            font-medium
            text-slate-300
            transition-colors
            hover:bg-slate-800
            hover:text-white
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-500/40
          "
        >
          <PhoneOff size={15} />
          Leave
        </button>
      </div>
    </div>
  );
};

/*
 * =====================================================
 * LEAVE CONFIRMATION MODAL
 * =====================================================
 */

const LeaveConfirmationModal = ({ onCancel, onConfirm, isLeaving }) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black/75
        p-4
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-meeting-title"
    >
      <div
        className="
          w-full
          max-w-sm
          overflow-hidden
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          shadow-2xl
          shadow-black/50
        "
      >
        {/* =================================================
            MODAL CONTENT
        ================================================= */}

        <div className="p-6">
          {/* ICON */}

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-red-500/20
              bg-red-500/10
              text-red-400
            "
          >
            <AlertTriangle size={22} />
          </div>

          {/* TITLE */}

          <h2
            id="leave-meeting-title"
            className="
              mt-5
              text-lg
              font-semibold
              text-white
            "
          >
            Leave meeting?
          </h2>

          {/* DESCRIPTION */}

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-400
            "
          >
            Are you sure you want to leave this meeting? Your camera, microphone
            and connection will be disconnected.
          </p>

          {/* ACTIONS */}

          <div className="mt-6 flex gap-3">
            {/* CANCEL */}

            <button
              type="button"
              onClick={onCancel}
              disabled={isLeaving}
              className="
                flex
                h-11
                flex-1
                items-center
                justify-center
                rounded-xl
                border
                border-slate-700
                bg-slate-800
                px-4
                text-sm
                font-medium
                text-slate-200
                transition-colors
                hover:bg-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            {/* CONFIRM */}

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLeaving}
              className="
                flex
                h-11
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-600
                px-4
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isLeaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Leaving...
                </>
              ) : (
                <>
                  <PhoneOff size={16} />
                  Leave
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
 * =====================================================
 * MEETING ENDED SCREEN
 * =====================================================
 */

const MeetingEndedScreen = ({ meetingId, onRejoin, onReturnDashboard }) => {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-950
        px-4
        py-10
        text-white
      "
    >
      <div className="w-full max-w-md text-center">
        {/* =================================================
            SUCCESS ICON
        ================================================= */}

        <div
          className="
            mx-auto
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            border
            border-emerald-400/20
            bg-emerald-500/10
            shadow-xl
            shadow-emerald-950/20
          "
        >
          <CheckCircle2 size={42} className="text-emerald-400" />
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h1
          className="
            mt-6
            text-2xl
            font-semibold
            tracking-tight
            text-white
            sm:text-3xl
          "
        >
          Meeting ended
        </h1>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p
          className="
            mx-auto
            mt-3
            max-w-sm
            text-sm
            leading-6
            text-slate-400
          "
        >
          You have left the meeting successfully. Your camera and microphone
          have been disconnected.
        </p>

        {/* =================================================
            MEETING ID
        ================================================= */}

        <div
          className="
            mx-auto
            mt-6
            max-w-xs
            rounded-xl
            border
            border-slate-800
            bg-slate-900/70
            px-4
            py-3
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-600
            "
          >
            Meeting ID
          </p>

          <p
            className="
              mt-1
              truncate
              font-mono
              text-sm
              text-slate-300
            "
          >
            {meetingId}
          </p>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className="
            mt-8
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:justify-center
          "
        >
          {/* REJOIN */}

          <button
            type="button"
            onClick={onRejoin}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              px-5
              text-sm
              font-medium
              text-slate-200
              transition-all
              hover:bg-slate-800
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500/40
            "
          >
            <RotateCcw size={16} />
            Rejoin
          </button>

          {/* DASHBOARD */}

          <button
            type="button"
            onClick={onReturnDashboard}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-indigo-600
              px-5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-indigo-950/30
              transition-all
              hover:bg-indigo-700
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500/40
            "
          >
            <Home size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Meeting;
