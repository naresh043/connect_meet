import {
  Users,
  X,
  User,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";

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
  const remoteCount = Object.keys(remoteUsers || {}).length;
  const participantCount = 1 + remoteCount;

  return (
    <>
      {/* MOBILE BACKDROP */}
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
      />

      {/* PANEL */}
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
            sm:h-auto
            sm:max-h-[calc(100vh-100px)]
            sm:rounded-2xl
            sm:border
          "
        >
          {/* HEADER */}
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-800
              px-4
              py-4
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-500/10
                  text-indigo-400
                "
              >
                <Users size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Participants
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {participantCount}{" "}
                  {participantCount === 1
                    ? "person"
                    : "people"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition
                hover:bg-slate-800
                hover:text-white
                cursor-pointer
              "
              title="Close participants"
            >
              <X size={18} />
            </button>
          </div>

          {/* LIST */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* CURRENT USER */}
            <ParticipantRow
              name={currentUser?.name || "You"}
              email={currentUser?.email}
              isYou
              muted={isMuted}
              cameraOff={isCameraOff}
            />

            {/* REMOTE USERS */}
            {Object.entries(remoteUsers || {}).map(
              ([socketId, participant]) => {
                const stream =
                  remoteStreams?.[socketId];

                return (
                  <ParticipantRow
                    key={socketId}
                    name={
                      participant?.name ||
                      "Participant"
                    }
                    email={participant?.email}
                    muted={getRemoteMicStatus(
                      participant,
                      stream
                    )}
                    cameraOff={getRemoteCameraStatus(
                      participant,
                      stream
                    )}
                  />
                );
              }
            )}

            {/* EMPTY */}
            {remoteCount === 0 && (
              <div className="px-4 py-8 text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-900
                    text-slate-600
                  "
                >
                  <Users size={20} />
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  You are the only participant
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Share the meeting link to invite others.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* =====================================================
   PARTICIPANT ROW
===================================================== */

const ParticipantRow = ({
  name,
  email,
  isYou = false,
  muted = false,
  cameraOff = false,
}) => {
  const avatar = (name || "P")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className="
        flex
        items-center
        gap-3
        border-b
        border-slate-800/80
        px-4
        py-3
      "
    >
      {/* AVATAR */}
      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          ${
            isYou
              ? "bg-indigo-600 text-white"
              : "bg-slate-800 text-slate-300"
          }
        `}
      >
        {avatar ? (
          <span className="text-sm font-semibold">
            {avatar}
          </span>
        ) : (
          <User size={17} />
        )}
      </div>

      {/* USER INFO */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">
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

        {email && (
          <p className="mt-0.5 truncate text-xs text-slate-600">
            {email}
          </p>
        )}
      </div>

      {/* MEDIA STATUS */}
      <div className="flex shrink-0 items-center gap-2">
        <div
          className={`
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            ${
              muted
                ? "bg-red-500/10 text-red-400"
                : "bg-slate-900 text-slate-400"
            }
          `}
        >
          {muted ? (
            <MicOff size={14} />
          ) : (
            <Mic size={14} />
          )}
        </div>

        <div
          className={`
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            ${
              cameraOff
                ? "bg-red-500/10 text-red-400"
                : "bg-slate-900 text-slate-400"
            }
          `}
        >
          {cameraOff ? (
            <VideoOff size={14} />
          ) : (
            <Video size={14} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantPanel;