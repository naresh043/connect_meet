import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Copy,
  Check,
  Phone,
} from "lucide-react";

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

  /*
   * =====================================================
   * COPY MEETING LINK
   * =====================================================
   */

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.href,
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  /*
   * =====================================================
   * BUTTON BASE STYLES
   * =====================================================
   */

  const baseButtonClass = `
    flex
    h-11
    w-11
    shrink-0
    items-center
    justify-center
    rounded-xl
    transition-all
    duration-200
    cursor-pointer
    select-none
    focus:outline-none
    focus:ring-2
    focus:ring-indigo-500/40
    sm:h-12
    sm:w-12
  `;

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

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
        {/* =================================================
            MICROPHONE
        ================================================= */}

        <button
          type="button"
          onClick={onToggleMic}
          title={
            isMuted
              ? "Unmute microphone"
              : "Mute microphone"
          }
          aria-label={
            isMuted
              ? "Unmute microphone"
              : "Mute microphone"
          }
          aria-pressed={isMuted}
          className={`
            ${baseButtonClass}

            ${
              isMuted
                ? `
                  bg-red-500
                  text-white
                  shadow-md
                  shadow-red-950/30
                  hover:bg-red-600
                `
                : `
                  bg-slate-800
                  text-slate-200
                  hover:bg-slate-700
                  hover:text-white
                `
            }
          `}
        >
          {isMuted ? (
            <MicOff size={19} strokeWidth={2.2} />
          ) : (
            <Mic size={19} strokeWidth={2.2} />
          )}
        </button>

        {/* =================================================
            CAMERA
        ================================================= */}

        <button
          type="button"
          onClick={onToggleCamera}
          title={
            isCameraOff
              ? "Turn camera on"
              : "Turn camera off"
          }
          aria-label={
            isCameraOff
              ? "Turn camera on"
              : "Turn camera off"
          }
          aria-pressed={isCameraOff}
          className={`
            ${baseButtonClass}

            ${
              isCameraOff
                ? `
                  bg-red-500
                  text-white
                  shadow-md
                  shadow-red-950/30
                  hover:bg-red-600
                `
                : `
                  bg-slate-800
                  text-slate-200
                  hover:bg-slate-700
                  hover:text-white
                `
            }
          `}
        >
          {isCameraOff ? (
            <VideoOff size={19} strokeWidth={2.2} />
          ) : (
            <Video size={19} strokeWidth={2.2} />
          )}
        </button>

        {/* =================================================
            PARTICIPANTS
        ================================================= */}

        <button
          type="button"
          onClick={onParticipants}
          title="Participants"
          aria-label="Open participants"
          className={`
            ${baseButtonClass}

            bg-slate-800
            text-slate-200
            hover:bg-slate-700
            hover:text-white
          `}
        >
          <Users size={19} strokeWidth={2.2} />
        </button>

        {/* =================================================
            COPY MEETING LINK
        ================================================= */}

        <button
          type="button"
          onClick={copyMeetingLink}
          title={
            copied
              ? "Meeting link copied"
              : "Copy meeting link"
          }
          aria-label={
            copied
              ? "Meeting link copied"
              : "Copy meeting link"
          }
          className={`
            ${baseButtonClass}

            bg-slate-800
            text-slate-200
            hover:bg-slate-700
            hover:text-white
          `}
        >
          {copied ? (
            <Check
              size={19}
              strokeWidth={2.4}
              className="text-emerald-400"
            />
          ) : (
            <Copy
              size={19}
              strokeWidth={2.2}
            />
          )}
        </button>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div
          aria-hidden="true"
          className="
            mx-1
            h-7
            w-px
            shrink-0
            bg-slate-800
          "
        />

        {/* =================================================
            LEAVE MEETING
        ================================================= */}

        <button
          type="button"
          onClick={onLeave}
          title="Leave meeting"
          aria-label="Leave meeting"
          className={`
            ${baseButtonClass}

            bg-red-500
            text-white
            shadow-md
            shadow-red-950/30
            hover:bg-red-600
            hover:shadow-lg
            hover:shadow-red-950/40
            focus:ring-red-500/40
          `}
        >
          <Phone
            size={19}
            strokeWidth={2.2}
            className="rotate-[135deg]"
          />
        </button>
      </div>
    </div>
  );
};

export default MeetingControls;