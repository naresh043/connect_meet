import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Video, ArrowRight, Copy, Check, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MeetingCard = ({ meeting }) => {
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const isEnded = meeting.status === "ended";

  const handleJoin = () => {
    if (isEnded) {
      return;
    }

    navigate(`/meeting/${meeting.meetingId}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meeting.meetingId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to copy meeting ID:", error);
    }
  };

  const formattedDate = meeting.createdAt
    ? new Date(meeting.createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently created";

  return (
    <article
      className="
        group
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-indigo-200
        hover:shadow-md
        hover:shadow-slate-200/50
        sm:p-5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* LEFT */}

        <div className="flex min-w-0 items-start gap-4">
          {/* Meeting icon */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-indigo-50
              text-indigo-600
              transition-colors
              duration-200
              group-hover:bg-indigo-100
            "
          >
            <Video size={19} strokeWidth={2.2} />
          </div>

          {/* Details */}

          <div className="min-w-0">
            {/* Title + status */}

            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="
                  truncate
                  text-base
                  font-bold
                  tracking-tight
                  text-slate-950
                  sm:text-lg
                "
              >
                {meeting.title}
              </h3>

              <Badge
                variant="outline"
                className={
                  isEnded
                    ? `
                      rounded-full
                      border-slate-200
                      bg-slate-50
                      px-2
                      py-0.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    `
                    : `
                      rounded-full
                      border-emerald-100
                      bg-emerald-50
                      px-2
                      py-0.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-emerald-600
                      hover:bg-emerald-50
                    `
                }
              >
                {!isEnded && (
                  <span
                    className="
                      mr-1.5
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-500
                    "
                  />
                )}

                {meeting.status}
              </Badge>
            </div>

            {/* Meeting ID */}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-400">
                Meeting ID
              </span>

              <span
                className="
                  rounded-md
                  bg-slate-100
                  px-2
                  py-1
                  font-mono
                  text-xs
                  font-semibold
                  tracking-wider
                  text-slate-700
                "
              >
                {meeting.meetingId}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                title={copied ? "Copied" : "Copy meeting ID"}
                className="
                  h-7
                  w-7
                  rounded-md
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-indigo-600
                  focus:ring-2
                  focus:ring-indigo-500/10
                "
              >
                {copied ? (
                  <Check
                    size={14}
                    strokeWidth={2.5}
                    className="text-emerald-500"
                  />
                ) : (
                  <Copy size={14} />
                )}
              </Button>
            </div>

            {/* Date */}

            <div
              className="
                mt-2
                flex
                items-center
                gap-1.5
                text-xs
                text-slate-400
              "
            >
              <Clock3 size={13} />

              {formattedDate}
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <Button
          type="button"
          onClick={handleJoin}
          disabled={isEnded}
          variant="outline"
          className={
            isEnded
              ? `
        h-10
        w-full
        shrink-0
        gap-2
        rounded-xl
        border-slate-200
        bg-slate-50
        px-5
        text-sm
        font-semibold
        text-slate-400
        shadow-none
        cursor-not-allowed
        sm:w-auto
      `
              : `
        h-10
        w-full
        shrink-0
        gap-2
        rounded-xl
        border-indigo-100
        bg-indigo-50
        px-5
        text-sm
        font-semibold
        text-indigo-600
        shadow-none
        transition-all
        duration-200
        cursor-pointer
        hover:-translate-y-0.5
        hover:border-indigo-600
        hover:bg-indigo-600
        hover:text-white
        hover:shadow-md
        focus:ring-4
        focus:ring-indigo-500/10
        sm:w-auto
      `
          }
        >
          {isEnded ? "Ended" : "Join meeting"}

          {!isEnded && <ArrowRight size={16} />}
        </Button>
      </div>
    </article>
  );
};

export default MeetingCard;
