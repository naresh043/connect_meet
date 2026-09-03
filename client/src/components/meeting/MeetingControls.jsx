import { Mic, MicOff, Video, VideoOff, Users, Copy, Phone } from "lucide-react";

import { useState } from "react";

const MeetingControls = ({
  isMuted,
  isCameraOff,
  onToggleMic,
  onToggleCamera,
  onLeave,
  onParticipants,
}) => {
  const [copied, setCopied] = useState(false);

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div
      className="
        fixed
        bottom-4
        left-1/2
        z-50
        -translate-x-1/2
        sm:bottom-6
      "
    >
      <div
        className="
          flex
          items-center
          gap-1.5
          rounded-2xl
          border
          border-slate-700/80
          bg-slate-950/95
          px-2.5
          py-2.5
          shadow-2xl
          shadow-black/40
          backdrop-blur-xl
          sm:gap-2
          sm:px-3
        "
      >
        {/* MICROPHONE */}
        <button
          type="button"
          onClick={onToggleMic}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            transition-all
            duration-200
            cursor-pointer
            sm:h-12
            sm:w-12
            ${
              isMuted
                ? "bg-red-500 text-white shadow-md shadow-red-950/30 hover:bg-red-600"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            }
          `}
        >
          {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
        </button>

        {/* CAMERA */}
        <button
          type="button"
          onClick={onToggleCamera}
          title={isCameraOff ? "Turn camera on" : "Turn camera off"}
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            transition-all
            duration-200
            cursor-pointer
            sm:h-12
            sm:w-12
            ${
              isCameraOff
                ? "bg-red-500 text-white shadow-md shadow-red-950/30 hover:bg-red-600"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            }
          `}
        >
          {isCameraOff ? <VideoOff size={19} /> : <Video size={19} />}
        </button>

        {/* PARTICIPANTS */}
        <button
          type="button"
          onClick={onParticipants}
          title="Participants"
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-slate-800
            text-slate-200
            transition-all
            duration-200
            hover:bg-slate-700
            hover:text-white
            cursor-pointer
            sm:h-12
            sm:w-12
          "
        >
          <Users size={19} />
        </button>

        {/* COPY */}
        <button
          type="button"
          onClick={copyMeetingLink}
          title="Copy meeting link"
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-slate-800
            text-slate-200
            transition-all
            duration-200
            hover:bg-slate-700
            hover:text-white
            cursor-pointer
            sm:h-12
            sm:w-12
          "
        >
          {copied ? (
            <span className="text-emerald-400">
              <Copy size={18} />
            </span>
          ) : (
            <Copy size={19} />
          )}
        </button>

        {/* DIVIDER */}
        <div className="mx-1 h-7 w-px bg-slate-800" />

        {/* LEAVE */}
        <button
          type="button"
          onClick={onLeave}
          title="Leave meeting"
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-red-500
            text-white
            shadow-md
            shadow-red-950/30
            transition-all
            duration-200
            hover:bg-red-600
            hover:shadow-lg
            cursor-pointer
            sm:h-12
            sm:w-12
          "
        >
          <Phone size={19} className="rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
};

export default MeetingControls;
