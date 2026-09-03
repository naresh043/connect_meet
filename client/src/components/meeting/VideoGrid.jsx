import { memo, useCallback, useMemo, useState } from "react";
import { Check, Copy, Users } from "lucide-react";

import VideoTile from "./VideoTile";

const GRID_CLASSES = {
  1: "grid-cols-1 max-w-5xl",
  2: "grid-cols-1 md:grid-cols-2 max-w-6xl",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2",
  default: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

const VideoGrid = ({
  currentUser,
  localStream,
  remoteStreams,
  remoteUsers,
  isMuted,
  isCameraOff,
  meetingId,
}) => {
  const [copied, setCopied] = useState(false);

  /*
   * Calculate participants once per remoteUsers change.
   */
  const remoteParticipants = useMemo(
    () => Object.entries(remoteUsers || {}),
    [remoteUsers],
  );

  const remoteCount = remoteParticipants.length;
  const totalParticipants = remoteCount + 1;

  /*
   * Select the appropriate grid layout.
   */
  const gridClass = useMemo(() => {
    return GRID_CLASSES[totalParticipants] || GRID_CLASSES.default;
  }, [totalParticipants]);

  /*
   * Copy meeting ID.
   */
  const copyMeetingId = useCallback(async () => {
    if (!meetingId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(meetingId);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }, [meetingId]);

  return (
    <main
      className="
        w-full
        px-3
        pb-32
        pt-4
        sm:px-5
        sm:pb-32
        sm:pt-5
        lg:px-6
      "
    >
      {/* PARTICIPANT COUNT */}
      <div
        className="
          mx-auto
          mb-4
          flex
          max-w-7xl
          items-center
          justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            text-slate-400
          "
        >
          <Users size={16} aria-hidden="true" />

          <span>
            {totalParticipants}{" "}
            {totalParticipants === 1 ? "participant" : "participants"}
          </span>
        </div>
      </div>

      {/* VIDEO GRID */}
      <div
        className={`
          mx-auto
          grid
          w-full
          gap-3
          sm:gap-4
          lg:gap-5
          ${gridClass}
        `}
      >
        {/* LOCAL VIDEO */}
        {localStream && (
          <VideoTile
            stream={localStream}
            name={currentUser?.name || "You"}
            muted
            isLocal
            isCameraOff={isCameraOff}
            isMuted={isMuted}
          />
        )}

        {/* REMOTE VIDEOS */}
        {remoteParticipants.map(([socketId, participant]) => (
          <VideoTile
            key={socketId}
            stream={remoteStreams?.[socketId]}
            name={participant?.name || "Participant"}
            muted={false}
            isLocal={false}
            isCameraOff={Boolean(participant?.isCameraOff)}
            isMuted={Boolean(participant?.isMuted)}
          />
        ))}
      </div>

      {/* WAITING STATE */}
      {remoteCount === 0 && (
        <div className="mx-auto mt-8 max-w-md text-center">
          <div
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/70
              p-6
              shadow-lg
            "
          >
            {/* ICON */}
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-indigo-500/10
                text-indigo-400
              "
            >
              <Users size={21} aria-hidden="true" />
            </div>

            {/* TITLE */}
            <h3
              className="
                mt-4
                text-sm
                font-semibold
                text-white
              "
            >
              Waiting for another participant
            </h3>

            {/* DESCRIPTION */}
            <p
              className="
                mt-1.5
                text-xs
                leading-5
                text-slate-500
              "
            >
              Share the meeting ID below to invite someone to this meeting.
            </p>

            {/* MEETING ID */}
            <div className="mt-4 flex items-center gap-2">
              <div
                className="
                  min-w-0
                  flex-1
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950
                  px-3
                  py-2.5
                  text-center
                  font-mono
                  text-xs
                  text-slate-300
                "
              >
                <span className="block truncate">{meetingId}</span>
              </div>

              {/* COPY BUTTON */}
              <button
                type="button"
                onClick={copyMeetingId}
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-600
                  text-white
                  transition-colors
                  duration-200
                  hover:bg-indigo-700
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-indigo-400
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-slate-950
                "
                title="Copy meeting ID"
                aria-label="Copy meeting ID"
              >
                {copied ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Copy size={16} aria-hidden="true" />
                )}
              </button>
            </div>

            {/* COPY SUCCESS */}
            {copied && (
              <p
                className="
                  mt-2
                  text-xs
                  font-medium
                  text-emerald-400
                "
                role="status"
              >
                Meeting ID copied
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default memo(VideoGrid);
