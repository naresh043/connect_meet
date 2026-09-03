import {
  Users,
  X,
  User,
  Mic,
  MicOff,
  Video,
  VideoOff,
  CheckCircle2,
} from "lucide-react";

import { useEffect } from "react";

import {
  getRemoteCameraStatus,
  getRemoteMicStatus,
} from "../../utils/meetingUtils";

const ParticipantPanel = ({
  currentUser,
  remoteUsers,
  remoteStreams,
  isMuted,
  isCameraOff,
  onClose,
}) => {
  const remoteEntries = Object.entries(remoteUsers || {});

  const remoteCount = remoteEntries.length;

  const participantCount = 1 + remoteCount;

  /*
   * =====================================================
   * ESCAPE KEY
   * =====================================================
   */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  /*
   * =====================================================
   * PREVENT BODY SCROLL ON MOBILE
   * =====================================================
   */

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <>
      {/* =================================================
          MOBILE BACKDROP
      ================================================= */}

      <div
        className="
          fixed
          inset-0
          z-[90]
          bg-black/60
          backdrop-blur-[2px]
          sm:hidden
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* =================================================
          PANEL
      ================================================= */}

      <div
        className="
          fixed
          bottom-0
          right-0
          top-0
          z-[100]
          w-full
          max-w-sm
          sm:bottom-auto
          sm:right-4
          sm:top-20
          sm:w-80
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="participants-title"
      >
        <div
          className="
            flex
            h-full
            flex-col
            overflow-hidden
            border-slate-800
            bg-slate-950
            shadow-2xl
            shadow-black/40
            sm:h-auto
            sm:max-h-[calc(100vh-100px)]
            sm:rounded-2xl
            sm:border
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-800
              px-4
              py-4
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              {/* ICON */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-500/10
                  text-indigo-400
                "
              >
                <Users size={18} strokeWidth={2.2} />
              </div>

              {/* TITLE */}

              <div className="min-w-0">
                <h2
                  id="participants-title"
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Participants
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {participantCount}{" "}
                  {participantCount === 1 ? "person" : "people"}
                </p>
              </div>
            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              title="Close participants"
              aria-label="Close participants"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition-all
                duration-200
                cursor-pointer
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500/40
                hover:bg-slate-800
                hover:text-white
              "
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          {/* =================================================
              PARTICIPANT COUNT BAR
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-800/80
              bg-slate-900/40
              px-4
              py-2.5
            "
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-emerald-400
                    opacity-50
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    h-2
                    w-2
                    rounded-full
                    bg-emerald-400
                  "
                />
              </span>

              <span className="text-[11px] font-medium text-slate-400">
                In this meeting
              </span>
            </div>

            <span className="text-[11px] font-semibold text-slate-500">
              {participantCount}
            </span>
          </div>

          {/* =================================================
              LIST
          ================================================= */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              scrollbar-thin
              scrollbar-track-transparent
              scrollbar-thumb-slate-800
            "
          >
            {/* =================================================
                CURRENT USER
            ================================================= */}

            <ParticipantRow
              name={currentUser?.name || "You"}
              email={currentUser?.email}
              isYou
              muted={isMuted}
              cameraOff={isCameraOff}
            />

            {/* =================================================
                REMOTE USERS
            ================================================= */}

            {remoteEntries.map(([socketId, participant]) => {
              const stream = remoteStreams?.[socketId];

              return (
                <ParticipantRow
                  key={socketId}
                  name={participant?.name || "Participant"}
                  email={participant?.email}
                  muted={getRemoteMicStatus(participant, stream)}
                  cameraOff={getRemoteCameraStatus(participant, stream)}
                />
              );
            })}

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {remoteCount === 0 && (
              <div className="px-5 py-9 text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900
                    text-slate-600
                  "
                >
                  <Users size={21} strokeWidth={1.8} />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-400">
                  You are the only participant
                </p>

                <p className="mx-auto mt-1.5 max-w-[220px] text-xs leading-5 text-slate-600">
                  Share the meeting link to invite someone to this meeting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/*
 * =====================================================
 * PARTICIPANT ROW
 * =====================================================
 */

const ParticipantRow = ({
  name,
  email,
  isYou = false,
  muted = false,
  cameraOff = false,
}) => {
  const avatar = (name || "P").trim().charAt(0).toUpperCase() || "P";

  return (
    <div
      className="
        group
        flex
        items-center
        gap-3
        border-b
        border-slate-800/80
        px-4
        py-3
        transition-colors
        duration-150
        hover:bg-slate-900/60
      "
    >
      {/* =================================================
          AVATAR
      ================================================= */}

      <div
        className={`
          relative
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          ${isYou ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"}
        `}
      >
        <span className="text-sm font-semibold">{avatar}</span>

        {/* ONLINE INDICATOR */}

        <span
          className="
            absolute
            bottom-0
            right-0
            h-2.5
            w-2.5
            rounded-full
            border-2
            border-slate-950
            bg-emerald-400
          "
          title="Connected"
        />
      </div>

      {/* =================================================
          USER INFO
      ================================================= */}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className="
              min-w-0
              truncate
              text-sm
              font-medium
              text-white
            "
            title={name}
          >
            {name}
          </p>

          {isYou && (
            <span
              className="
                shrink-0
                rounded-full
                bg-indigo-500/10
                px-2
                py-0.5
                text-[10px]
                font-semibold
                text-indigo-400
              "
            >
              You
            </span>
          )}
        </div>

        {email ? (
          <p
            className="
              mt-0.5
              truncate
              text-xs
              text-slate-600
            "
            title={email}
          >
            {email}
          </p>
        ) : (
          <div className="mt-0.5 flex items-center gap-1">
            <CheckCircle2 size={10} className="text-emerald-500" />

            <span className="text-[10px] text-slate-600">Connected</span>
          </div>
        )}
      </div>

      {/* =================================================
          MEDIA STATUS
      ================================================= */}

      <div className="flex shrink-0 items-center gap-1.5">
        <MediaStatus type="mic" off={muted} />

        <MediaStatus type="camera" off={cameraOff} />
      </div>
    </div>
  );
};

/*
 * =====================================================
 * MEDIA STATUS
 * =====================================================
 */

const MediaStatus = ({ type, off }) => {
  const isMic = type === "mic";

  const Icon = isMic ? (off ? MicOff : Mic) : off ? VideoOff : Video;

  return (
    <div
      className={`
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-lg
        ${off ? "bg-red-500/10 text-red-400" : "bg-slate-900 text-slate-500"}
      `}
      title={
        isMic
          ? off
            ? "Microphone muted"
            : "Microphone on"
          : off
            ? "Camera off"
            : "Camera on"
      }
    >
      <Icon size={14} strokeWidth={2} />
    </div>
  );
};

export default ParticipantPanel;
