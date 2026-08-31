import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Users,
  Clock,
  Copy,
  Check,
  Link,
  X,
  User,
  Mic,
  MicOff,
  VideoOff,
} from "feather-icons-react";

import useWebRTC from "../hooks/useWebRTC";

import MeetingControls from "../components/meeting/MeetingControls";

/*
=====================================================
VIDEO TILE
=====================================================
*/

const ResponsiveVideoTile = ({
  stream,
  name,
  muted = false,
  isLocal = false,
  isCameraOff = false,
  isMuted = false,
}) => {
  const [videoElement, setVideoElement] = useState(null);

  /*
  =====================================================
  ATTACH STREAM
  =====================================================
  */

  useEffect(() => {
    if (!videoElement) return;

    if (!stream) {
      videoElement.srcObject = null;
      return;
    }

    videoElement.srcObject = stream;

    const playVideo = async () => {
      try {
        await videoElement.play();
      } catch (error) {
        console.log("Video autoplay waiting...");
      }
    };

    playVideo();

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [stream, videoElement]);

  /*
  =====================================================
  AVATAR LETTER
  =====================================================
  */

  const avatarLetter = (name || "Participant")
    .trim()
    .charAt(0)
    .toUpperCase();

  /*
  =====================================================
  UI
  =====================================================
  */

  return (
    <div
      className="
        relative
        w-full
        aspect-video
        overflow-hidden
        rounded-2xl
        border
        border-slate-700
        bg-slate-900
      "
    >
      {/* =================================================
          VIDEO
          ================================================= */}

      {!isCameraOff && stream && (
        <video
          ref={setVideoElement}
          autoPlay
          playsInline
          muted={muted}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            bg-black
          "
        />
      )}

      {/* =================================================
          AVATAR
          CAMERA OFF
          ================================================= */}

      {(isCameraOff || !stream) && (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-slate-900
          "
        >
          <div
            className="
              w-20
              h-20
              sm:w-20
              sm:h-20
              rounded-full
              bg-slate-700
              flex
              items-center
              justify-center
            "
          >
            {avatarLetter ? (
              <span
                className="
                  text-3xl
                  font-medium
                  text-white
                "
              >
                {avatarLetter}
              </span>
            ) : (
              <User
                size={30}
                className="text-white"
              />
            )}
          </div>
        </div>
      )}

      {/* =================================================
          CAMERA OFF ICON
          TOP RIGHT
          ================================================= */}

      {(isCameraOff || !stream) && (
        <div
          className="
            absolute
            top-3
            right-3
            w-9
            h-9
            rounded-lg
            bg-black/80
            flex
            items-center
            justify-center
            z-20
          "
        >
          <VideoOff
            size={18}
            strokeWidth={1.8}
          />
        </div>
      )}

      {/* =================================================
          NAME + MICROPHONE
          BOTTOM LEFT
          ================================================= */}

      <div
        className="
          absolute
          left-3
          bottom-3
          z-20
          flex
          items-center
          gap-2
          max-w-[calc(100%-24px)]
          bg-black/80
          rounded-lg
          px-3
          py-2
        "
      >
        <span
          className="
            text-xs
            sm:text-sm
            font-medium
            text-white
            truncate
          "
        >
          {name || "Participant"}
          {isLocal ? " (You)" : ""}
        </span>

        {/* =================================================
            MICROPHONE STATUS
            ================================================= */}

        {isMuted ? (
          <MicOff
            size={15}
            className="
              flex-shrink-0
              text-white
            "
          />
        ) : (
          <Mic
            size={15}
            className="
              flex-shrink-0
              text-white
            "
          />
        )}
      </div>
    </div>
  );
};

/*
=====================================================
GET REMOTE CAMERA STATUS
=====================================================
*/

const getRemoteCameraStatus = (
  participant,
  stream,
) => {
  /*
  Explicit status from Socket.IO/WebRTC user data
  */

  if (
    typeof participant?.isCameraOff ===
    "boolean"
  ) {
    return participant.isCameraOff;
  }

  if (
    typeof participant?.cameraOff ===
    "boolean"
  ) {
    return participant.cameraOff;
  }

  if (
    typeof participant?.isVideoOff ===
    "boolean"
  ) {
    return participant.isVideoOff;
  }

  if (
    typeof participant?.videoOff ===
    "boolean"
  ) {
    return participant.videoOff;
  }

  /*
  If there is no stream, show avatar.
  */

  if (!stream) {
    return true;
  }

  /*
  If stream exists and no explicit status,
  assume camera is ON.
  */

  return false;
};

/*
=====================================================
GET REMOTE MICROPHONE STATUS
=====================================================
*/

const getRemoteMicStatus = (
  participant,
  stream,
) => {
  /*
  Explicit status from Socket.IO/WebRTC user data
  */

  if (
    typeof participant?.isMuted ===
    "boolean"
  ) {
    return participant.isMuted;
  }

  if (
    typeof participant?.muted ===
    "boolean"
  ) {
    return participant.muted;
  }

  if (
    typeof participant?.micOff ===
    "boolean"
  ) {
    return participant.micOff;
  }

  if (
    typeof participant?.isMicOff ===
    "boolean"
  ) {
    return participant.isMicOff;
  }

  /*
  Fallback to stream audio track.
  */

  const audioTracks =
    stream?.getAudioTracks?.() || [];

  if (audioTracks.length === 0) {
    return true;
  }

  return audioTracks.every(
    (track) => track.enabled === false,
  );
};

/*
=====================================================
MEETING
=====================================================
*/

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
      const storedUser =
        localStorage.getItem(
          "connectmeet_user",
        );

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch (error) {
      console.error(
        "❌ Failed to read stored user:",
        error,
      );

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

  const [meetingSeconds, setMeetingSeconds] =
    useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingSeconds(
        (previous) => previous + 1,
      );
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
    const hours = Math.floor(
      seconds / 3600,
    );

    const minutes = Math.floor(
      (seconds % 3600) / 60,
    );

    const remainingSeconds =
      seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        "0",
      )}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(
        remainingSeconds,
      ).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(
      2,
      "0",
    )}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  /*
  =====================================================
  PARTICIPANT COUNT
  =====================================================
  */

  const remoteParticipantCount =
    Object.keys(
      remoteUsers || {},
    ).length;

  const participantCount =
    1 + remoteParticipantCount;

  /*
  =====================================================
  PARTICIPANT PANEL
  =====================================================
  */

  const [showParticipants, setShowParticipants] =
    useState(false);

  /*
  =====================================================
  COPY STATE
  =====================================================
  */

  const [copiedType, setCopiedType] =
    useState(null);

  /*
  =====================================================
  COPY TEXT
  =====================================================
  */

  const copyText = async (
    text,
    type,
  ) => {
    try {
      await navigator.clipboard.writeText(
        text,
      );

      setCopiedType(type);

      setTimeout(() => {
        setCopiedType(null);
      }, 2000);
    } catch (error) {
      console.error(
        "❌ Copy failed:",
        error,
      );
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
  CLEANUP
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
  RESPONSIVE GRID
  =====================================================
  */

  const totalTiles =
    participantCount;

  const getGridClass = () => {
    /*
    1 PARTICIPANT
    */

    if (totalTiles === 1) {
      return "grid-cols-1 max-w-6xl mx-auto";
    }

    /*
    2 PARTICIPANTS
    */

    if (totalTiles === 2) {
      return "grid-cols-1 sm:grid-cols-2";
    }

    /*
    3 PARTICIPANTS
    */

    if (totalTiles === 3) {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }

    /*
    4+ PARTICIPANTS
    */

    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  /*
  =====================================================
  UI
  =====================================================
  */

  return (
    <div
      className="
        min-h-screen
        bg-gray-950
        text-white
        overflow-x-hidden
      "
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          bg-gray-900/95
          backdrop-blur-md
          border-b
          border-gray-800
        "
      >
        <div
          className="
            w-full
            px-3
            sm:px-5
            lg:px-6
            py-3
          "
        >
          {/* =================================================
              TOP HEADER
              ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            {/* BRAND */}

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <h1
                className="
                  font-bold
                  text-base
                  sm:text-lg
                  lg:text-xl
                  truncate
                "
              >
                ConnectMeet
              </h1>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  mt-0.5
                "
              >
                <span
                  className="
                    text-[10px]
                    sm:text-xs
                    text-gray-500
                  "
                >
                  Meeting ID:
                </span>

                <span
                  className="
                    font-mono
                    text-[10px]
                    sm:text-xs
                    text-gray-300
                    truncate
                  "
                >
                  {meetingId}
                </span>
              </div>
            </div>

            {/* =================================================
                HEADER ACTIONS
                ================================================= */}

            <div
              className="
                flex
                items-center
                gap-1.5
                sm:gap-2
                flex-shrink-0
              "
            >
              {/* CONNECTION */}

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  bg-gray-800
                  px-2.5
                  py-2
                  rounded-lg
                "
              >
                <span
                  className={`
                    w-2
                    h-2
                    rounded-full
                    flex-shrink-0
                    ${
                      isConnected
                        ? "bg-green-500"
                        : "bg-red-500"
                    }
                  `}
                />

                <span
                  className="
                    hidden
                    md:inline
                    text-xs
                    text-gray-300
                  "
                >
                  {isConnected
                    ? "Connected"
                    : "Connecting..."}
                </span>
              </div>

              {/* PARTICIPANTS */}

              <button
                type="button"
                onClick={() =>
                  setShowParticipants(
                    (previous) =>
                      !previous,
                  )
                }
                className={`
                  h-9
                  min-w-9
                  px-2.5
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  transition
                  ${
                    showParticipants
                      ? "bg-blue-600"
                      : "bg-gray-800 hover:bg-gray-700"
                  }
                `}
                title="View participants"
              >
                <Users size={16} />

                <span
                  className="
                    text-xs
                    sm:text-sm
                  "
                >
                  {participantCount}
                </span>
              </button>

              {/* TIMER */}

              <div
                className="
                  h-9
                  flex
                  items-center
                  gap-1.5
                  bg-gray-800
                  px-2.5
                  rounded-lg
                "
              >
                <Clock size={15} />

                <span
                  className="
                    font-mono
                    text-[11px]
                    sm:text-xs
                  "
                >
                  {formatMeetingTime(
                    meetingSeconds,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              MOBILE COPY BUTTONS
              ================================================= */}

          <div
            className="
              flex
              sm:hidden
              gap-2
              mt-2
            "
          >
            {/* COPY ID */}

            <button
              type="button"
              onClick={
                handleCopyMeetingId
              }
              className="
                flex-1
                h-9
                flex
                items-center
                justify-center
                gap-2
                bg-gray-800
                hover:bg-gray-700
                rounded-lg
                text-xs
                transition
              "
            >
              {copiedType === "id" ? (
                <>
                  <Check
                    size={15}
                    className="text-green-400"
                  />

                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={15} />

                  <span>Copy ID</span>
                </>
              )}
            </button>

            {/* COPY LINK */}

            <button
              type="button"
              onClick={
                handleCopyMeetingLink
              }
              className="
                flex-1
                h-9
                flex
                items-center
                justify-center
                gap-2
                bg-blue-600
                hover:bg-blue-700
                rounded-lg
                text-xs
                transition
              "
            >
              {copiedType === "link" ? (
                <>
                  <Check size={15} />

                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Link size={15} />

                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* =================================================
              DESKTOP COPY BUTTONS
              ================================================= */}

          <div
            className="
              hidden
              sm:flex
              justify-end
              gap-2
              mt-2
            "
          >
            {/* COPY ID */}

            <button
              type="button"
              onClick={
                handleCopyMeetingId
              }
              className="
                flex
                items-center
                gap-2
                bg-gray-800
                hover:bg-gray-700
                transition
                px-3
                py-2
                rounded-lg
                text-xs
              "
            >
              {copiedType === "id" ? (
                <>
                  <Check
                    size={15}
                    className="text-green-400"
                  />

                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={15} />

                  <span>Copy ID</span>
                </>
              )}
            </button>

            {/* COPY LINK */}

            <button
              type="button"
              onClick={
                handleCopyMeetingLink
              }
              className="
                flex
                items-center
                gap-2
                bg-blue-600
                hover:bg-blue-700
                transition
                px-3
                py-2
                rounded-lg
                text-xs
              "
            >
              {copiedType === "link" ? (
                <>
                  <Check size={15} />

                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Link size={15} />

                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          PARTICIPANT PANEL
          ===================================================== */}

      {showParticipants && (
        <>
          {/* MOBILE BACKDROP */}

          <div
            className="
              fixed
              inset-0
              z-[90]
              bg-black/50
              sm:hidden
            "
            onClick={() =>
              setShowParticipants(
                false,
              )
            }
          />

          {/* PANEL */}

          <div
            className="
              fixed
              top-0
              right-0
              bottom-0
              sm:top-20
              sm:right-4
              sm:bottom-auto
              z-[100]
              w-full
              sm:w-80
              max-w-sm
            "
          >
            <div
              className="
                h-full
                sm:h-auto
                bg-gray-900
                sm:border
                sm:border-gray-700
                sm:rounded-2xl
                shadow-2xl
                overflow-hidden
              "
            >
              {/* PANEL HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-4
                  py-4
                  border-b
                  border-gray-800
                "
              >
                <div>
                  <h2
                    className="
                      font-semibold
                      text-base
                      sm:text-lg
                    "
                  >
                    Participants
                  </h2>

                  <p
                    className="
                      text-xs
                      text-gray-400
                      mt-1
                    "
                  >
                    {participantCount}{" "}
                    {participantCount === 1
                      ? "person"
                      : "people"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowParticipants(
                      false,
                    )
                  }
                  className="
                    w-9
                    h-9
                    flex
                    items-center
                    justify-center
                    rounded-lg
                    hover:bg-gray-800
                    transition
                  "
                  title="Close participants"
                >
                  <X size={19} />
                </button>
              </div>

              {/* =================================================
                  PARTICIPANT LIST
                  ================================================= */}

              <div
                className="
                  overflow-y-auto
                  max-h-[calc(100vh-80px)]
                  sm:max-h-96
                "
              >
                {/* =================================================
                    LOCAL USER
                    ================================================= */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    border-b
                    border-gray-800
                  "
                >
                  {/* AVATAR */}

                  <div
                    className="
                      w-11
                      h-11
                      rounded-full
                      bg-blue-600
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  >
                    <span className="font-semibold">
                      {(currentUser?.name ||
                        "You")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  {/* INFO */}

                  <div
                    className="
                      flex-1
                      min-w-0
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <p
                        className="
                          font-medium
                          text-sm
                          truncate
                        "
                      >
                        {currentUser?.name ||
                          "You"}
                      </p>

                      <span
                        className="
                          flex-shrink-0
                          text-[10px]
                          bg-blue-600/20
                          text-blue-400
                          px-2
                          py-0.5
                          rounded-full
                        "
                      >
                        You
                      </span>
                    </div>

                    {currentUser?.email && (
                      <p
                        className="
                          text-xs
                          text-gray-500
                          truncate
                          mt-0.5
                        "
                      >
                        {currentUser.email}
                      </p>
                    )}
                  </div>

                  {/* MIC */}

                  {isMuted ? (
                    <MicOff
                      size={16}
                      className="
                        text-red-400
                        flex-shrink-0
                      "
                    />
                  ) : (
                    <Mic
                      size={16}
                      className="
                        text-gray-300
                        flex-shrink-0
                      "
                    />
                  )}

                  {/* CAMERA */}

                  {isCameraOff && (
                    <VideoOff
                      size={16}
                      className="
                        text-red-400
                        flex-shrink-0
                      "
                    />
                  )}
                </div>

                {/* =================================================
                    ALL REMOTE USERS
                    ================================================= */}

                {Object.entries(
                  remoteUsers || {},
                ).map(
                  ([
                    socketId,
                    participant,
                  ]) => {
                    /*
                    -------------------------------------------
                    REMOTE STREAM
                    -------------------------------------------
                    */

                    const stream =
                      remoteStreams?.[
                        socketId
                      ];

                    /*
                    -------------------------------------------
                    REMOTE NAME
                    -------------------------------------------
                    */

                    const participantName =
                      participant?.name ||
                      "Participant";

                    /*
                    -------------------------------------------
                    CAMERA STATUS
                    -------------------------------------------
                    */

                    const remoteCameraOff =
                      getRemoteCameraStatus(
                        participant,
                        stream,
                      );

                    /*
                    -------------------------------------------
                    MIC STATUS
                    -------------------------------------------
                    */

                    const remoteMuted =
                      getRemoteMicStatus(
                        participant,
                        stream,
                      );

                    return (
                      <div
                        key={socketId}
                        className="
                          flex
                          items-center
                          gap-3
                          px-4
                          py-3
                          border-b
                          border-gray-800
                        "
                      >
                        {/* AVATAR */}

                        <div
                          className="
                            w-11
                            h-11
                            rounded-full
                            bg-slate-700
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                          "
                        >
                          {participantName ? (
                            <span className="font-semibold">
                              {participantName
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          ) : (
                            <User size={18} />
                          )}
                        </div>

                        {/* INFO */}

                        <div
                          className="
                            flex-1
                            min-w-0
                          "
                        >
                          <p
                            className="
                              font-medium
                              text-sm
                              truncate
                            "
                          >
                            {
                              participantName
                            }
                          </p>

                          {participant?.email && (
                            <p
                              className="
                                text-xs
                                text-gray-500
                                truncate
                                mt-0.5
                              "
                            >
                              {
                                participant.email
                              }
                            </p>
                          )}
                        </div>

                        {/* MIC */}

                        {remoteMuted ? (
                          <MicOff
                            size={16}
                            className="
                              text-red-400
                              flex-shrink-0
                            "
                          />
                        ) : (
                          <Mic
                            size={16}
                            className="
                              text-gray-300
                              flex-shrink-0
                            "
                          />
                        )}

                        {/* CAMERA */}

                        {remoteCameraOff && (
                          <VideoOff
                            size={16}
                            className="
                              text-red-400
                              flex-shrink-0
                            "
                          />
                        )}
                      </div>
                    );
                  },
                )}

                {/* =================================================
                    ONLY USER
                    ================================================= */}

                {remoteParticipantCount ===
                  0 && (
                  <div
                    className="
                      px-4
                      py-8
                      text-center
                    "
                  >
                    <div
                      className="
                        w-12
                        h-12
                        mx-auto
                        rounded-full
                        bg-gray-800
                        flex
                        items-center
                        justify-center
                        mb-3
                      "
                    >
                      <Users
                        size={22}
                        className="text-gray-500"
                      />
                    </div>

                    <p
                      className="
                        text-sm
                        text-gray-400
                      "
                    >
                      You are the only
                      participant
                    </p>

                    <p
                      className="
                        text-xs
                        text-gray-600
                        mt-1
                      "
                    >
                      Share the meeting link
                      to invite others.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          VIDEO AREA
          ===================================================== */}

      <main
        className="
          w-full
          px-3
          sm:px-5
          lg:px-6
          py-4
          sm:py-6
          pb-28
          sm:pb-32
        "
      >
        {/* =================================================
            VIDEO GRID
            ================================================= */}

        <div
          className={`
            w-full
            grid
            gap-3
            sm:gap-4
            lg:gap-5
            ${getGridClass()}
          `}
        >
          {/* =================================================
              LOCAL USER
              ================================================= */}

          {localStream && (
            <ResponsiveVideoTile
              stream={localStream}
              name={
                currentUser?.name ||
                "You"
              }
              muted={true}
              isLocal={true}
              isCameraOff={isCameraOff}
              isMuted={isMuted}
            />
          )}

          {/* =================================================
              EVERY REMOTE USER
              ================================================= */}

          {Object.entries(
            remoteUsers || {},
          ).map(
            ([
              socketId,
              participant,
            ]) => {
              /*
              -----------------------------------------------
              GET REMOTE STREAM
              -----------------------------------------------
              */

              const stream =
                remoteStreams?.[
                  socketId
                ];

              /*
              -----------------------------------------------
              GET NAME
              -----------------------------------------------
              */

              const participantName =
                participant?.name ||
                "Participant";

              /*
              -----------------------------------------------
              CAMERA STATUS
              -----------------------------------------------
              */

              const remoteCameraOff =
                getRemoteCameraStatus(
                  participant,
                  stream,
                );

              /*
              -----------------------------------------------
              MICROPHONE STATUS
              -----------------------------------------------
              */

              const remoteMuted =
                getRemoteMicStatus(
                  participant,
                  stream,
                );

              return (
                <ResponsiveVideoTile
                  key={socketId}
                  stream={stream}
                  name={participantName}
                  muted={false}
                  isLocal={false}
                  isCameraOff={
                    remoteCameraOff
                  }
                  isMuted={
                    remoteMuted
                  }
                />
              );
            },
          )}
        </div>

        {/* =================================================
            WAITING MESSAGE
            ================================================= */}

        {remoteParticipantCount ===
          0 && (
          <div
            className="
              text-center
              mt-6
              sm:mt-8
              px-4
            "
          >
            <p
              className="
                text-sm
                sm:text-base
                text-gray-400
              "
            >
              Waiting for another
              participant...
            </p>

            <p
              className="
                text-xs
                sm:text-sm
                text-gray-600
                mt-2
              "
            >
              Share this Meeting ID:
            </p>

            <button
              type="button"
              onClick={
                handleCopyMeetingId
              }
              className="
                max-w-full
                inline-flex
                items-center
                gap-2
                mt-2
                bg-gray-800
                hover:bg-gray-700
                transition
                px-3
                sm:px-4
                py-2
                rounded-lg
                font-mono
                text-xs
                sm:text-sm
              "
            >
              <span className="truncate">
                {meetingId}
              </span>

              {copiedType ===
              "id" ? (
                <Check
                  size={15}
                  className="flex-shrink-0"
                />
              ) : (
                <Copy
                  size={15}
                  className="flex-shrink-0"
                />
              )}
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
        onToggleMic={
          toggleMicrophone
        }
        onToggleCamera={
          toggleCamera
        }
        onLeave={handleLeave}
      />
    </div>
  );
};

export default Meeting;