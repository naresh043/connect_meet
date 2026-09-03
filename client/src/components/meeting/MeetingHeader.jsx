import {
  Users,
  Clock3,
  Copy,
  Check,
  Link as LinkIcon,
  Video,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

const MeetingHeader = ({
  meetingId,
  participantCount,
  isConnected,
  meetingTime,
  onParticipants,
}) => {
  const [copied, setCopied] = useState(null);

  const copyTimeoutRef = useRef(null);

  /*
   * =====================================================
   * CLEANUP COPY TIMER
   * =====================================================
   */

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  /*
   * =====================================================
   * COPY TEXT
   * =====================================================
   */

  const copyText = async (text, type) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      setCopied(type);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);

      /*
       * Fallback for browsers where clipboard API
       * is unavailable.
       */

      try {
        const textarea = document.createElement("textarea");

        textarea.value = text;

        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        document.execCommand("copy");

        document.body.removeChild(textarea);

        setCopied(type);

        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }

        copyTimeoutRef.current = setTimeout(() => {
          setCopied(null);
        }, 2000);
      } catch (fallbackError) {
        console.error("Clipboard fallback failed:", fallbackError);
      }
    }
  };

  /*
   * =====================================================
   * COPY MEETING ID
   * =====================================================
   */

  const copyMeetingId = () => {
    copyText(meetingId, "id");
  };

  /*
   * =====================================================
   * COPY MEETING LINK
   * =====================================================
   */

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${meetingId}`;

    copyText(link, "link");
  };

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-800
        bg-slate-950/95
        shadow-lg
        shadow-black/10
        backdrop-blur-xl
      "
    >
      <div
        className="
          px-3
          py-3
          sm:px-5
          sm:py-3.5
          lg:px-6
        "
      >
        {/* =================================================
            TOP ROW
        ================================================= */}

        <div className="flex items-center justify-between gap-3">
          {/* =================================================
              BRAND
          ================================================= */}

          <div className="flex min-w-0 items-center gap-3">
            {/* LOGO */}

            <div
              className="
                hidden
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-indigo-600
                text-white
                shadow-md
                shadow-indigo-950/40
                sm:flex
              "
            >
              <Video size={18} strokeWidth={2.2} />
            </div>

            {/* BRAND INFO */}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="
                    truncate
                    text-base
                    font-bold
                    tracking-tight
                    text-white
                    sm:text-lg
                  "
                >
                  ConnectMeet
                </h1>

                {/* DESKTOP CONNECTION STATUS */}

                <div
                  className={`
                    hidden
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-2
                    py-1
                    text-[10px]
                    font-semibold
                    sm:flex
                    ${
                      isConnected
                        ? `
                          border-emerald-500/10
                          bg-emerald-500/10
                          text-emerald-400
                        `
                        : `
                          border-red-500/10
                          bg-red-500/10
                          text-red-400
                        `
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${isConnected ? "bg-emerald-400" : "bg-red-400"}
                    `}
                  />

                  {isConnected ? "Connected" : "Connecting..."}
                </div>
              </div>

              {/* MEETING ID */}

              <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                <span
                  className="
                    shrink-0
                    text-[10px]
                    text-slate-600
                    sm:text-xs
                  "
                >
                  Meeting ID
                </span>

                <span
                  className="
                    truncate
                    font-mono
                    text-[10px]
                    text-slate-400
                    sm:text-xs
                  "
                  title={meetingId}
                >
                  {meetingId}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              sm:gap-2
            "
          >
            {/* MOBILE CONNECTION */}

            <div
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                sm:hidden
                ${isConnected ? "bg-emerald-500/10" : "bg-red-500/10"}
              `}
              title={isConnected ? "Connected" : "Connecting..."}
              aria-label={isConnected ? "Connected" : "Connecting..."}
            >
              <span
                className={`
                  h-2
                  w-2
                  rounded-full
                  ${isConnected ? "bg-emerald-400" : "bg-red-400"}
                `}
              />
            </div>

            {/* PARTICIPANTS */}

            <button
              type="button"
              onClick={onParticipants}
              title="Participants"
              aria-label={`Open participants, ${participantCount} ${
                participantCount === 1 ? "participant" : "participants"
              }`}
              className="
                flex
                h-9
                min-w-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-slate-800
                bg-slate-900
                px-2.5
                text-slate-300
                transition-all
                duration-200
                cursor-pointer
                select-none
                hover:border-slate-700
                hover:bg-slate-800
                hover:text-white
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500/40
              "
            >
              <Users size={16} strokeWidth={2.2} />

              <span className="text-xs font-medium sm:text-sm">
                {participantCount}
              </span>
            </button>

            {/* TIMER */}

            <div
              className="
                flex
                h-9
                items-center
                gap-1.5
                rounded-lg
                border
                border-slate-800
                bg-slate-900
                px-2.5
                text-slate-300
              "
              title="Meeting duration"
            >
              <Clock3 size={14} strokeWidth={2.2} />

              <span
                className="
                  font-mono
                  text-[11px]
                  tabular-nums
                  sm:text-xs
                "
              >
                {meetingTime}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            COPY ACTIONS
        ================================================= */}

        <div
          className="
            mt-2.5
            flex
            gap-2
          "
        >
          {/* =================================================
              COPY ID
          ================================================= */}

          <button
            type="button"
            onClick={copyMeetingId}
            title={copied === "id" ? "Meeting ID copied" : "Copy meeting ID"}
            aria-label={
              copied === "id" ? "Meeting ID copied" : "Copy meeting ID"
            }
            className="
              flex
              min-h-9
              flex-1
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-slate-800
              bg-slate-900
              px-3
              py-2
              text-xs
              font-medium
              text-slate-300
              transition-all
              duration-200
              cursor-pointer
              select-none
              hover:border-slate-700
              hover:bg-slate-800
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500/40
              sm:flex-none
            "
          >
            {copied === "id" ? (
              <>
                <Check
                  size={14}
                  strokeWidth={2.4}
                  className="text-emerald-400"
                />

                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} strokeWidth={2.2} />

                <span>Copy ID</span>
              </>
            )}
          </button>

          {/* =================================================
              COPY LINK
          ================================================= */}

          <button
            type="button"
            onClick={copyMeetingLink}
            title={
              copied === "link" ? "Meeting link copied" : "Copy meeting link"
            }
            aria-label={
              copied === "link" ? "Meeting link copied" : "Copy meeting link"
            }
            className="
              flex
              min-h-9
              flex-1
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-indigo-600
              px-3
              py-2
              text-xs
              font-semibold
              text-white
              shadow-sm
              shadow-indigo-950/30
              transition-all
              duration-200
              cursor-pointer
              select-none
              hover:-translate-y-0.5
              hover:bg-indigo-700
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500/50
              sm:flex-none
            "
          >
            {copied === "link" ? (
              <>
                <Check size={14} strokeWidth={2.4} />

                <span>Copied</span>
              </>
            ) : (
              <>
                <LinkIcon size={14} strokeWidth={2.2} />

                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default MeetingHeader;
