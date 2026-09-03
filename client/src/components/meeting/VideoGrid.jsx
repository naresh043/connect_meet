import { Users, Copy, Check } from "lucide-react";
import { useState } from "react";

import VideoTile from "./VideoTile";

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

  const remoteCount = Object.keys(remoteUsers || {}).length;
  const totalParticipants = 1 + remoteCount;

  const getGridClass = () => {
    if (totalParticipants === 1) {
      return "grid-cols-1 max-w-5xl mx-auto";
    }

    if (totalParticipants === 2) {
      return "grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto";
    }

    if (totalParticipants === 3) {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }

    if (totalParticipants === 4) {
      return "grid-cols-1 sm:grid-cols-2";
    }

    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <main className="w-full px-3 pb-32 pt-4 sm:px-5 sm:pb-32 sm:pt-5 lg:px-6">
      {/* PARTICIPANT COUNT */}
      <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Users size={16} />

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
          ${getGridClass()}
        `}
      >
        {/* LOCAL */}
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

        {/* REMOTE */}
        {Object.entries(remoteUsers || {}).map(([socketId, participant]) => {
          const stream = remoteStreams?.[socketId];

          return (
            <VideoTile
              key={socketId}
              stream={stream}
              name={participant?.name || "Participant"}
              muted={false}
              isLocal={false}
              isCameraOff={Boolean(participant?.isCameraOff)}
              isMuted={Boolean(participant?.isMuted)}
            />
          );
        })}
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
              <Users size={21} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-white">
              Waiting for another participant
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Share the meeting ID below to invite someone to this meeting.
            </p>

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

              <button
                type="button"
                onClick={copyMeetingId}
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-600
                  text-white
                  transition-all
                  duration-200
                  hover:bg-indigo-700
                  cursor-pointer
                "
                title="Copy meeting ID"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {copied && (
              <p className="mt-2 text-xs font-medium text-emerald-400">
                Meeting ID copied
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default VideoGrid;
