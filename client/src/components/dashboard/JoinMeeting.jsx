import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { LogIn, ArrowRight, Loader2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { joinMeeting } from "../../features/meetings/meetingSlice";

const JoinMeeting = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isJoining } = useSelector((state) => state.meetings);

  const [meetingId, setMeetingId] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanMeetingId = meetingId.trim().toUpperCase();

    if (!cleanMeetingId || isJoining) {
      return;
    }

    const result = await dispatch(joinMeeting(cleanMeetingId));

    if (joinMeeting.fulfilled.match(result)) {
      navigate(`/meeting/${cleanMeetingId}`);
    }
  };

  const isDisabled = isJoining || !meetingId.trim();

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-cyan-200
        hover:shadow-md
        hover:shadow-cyan-100/40
        sm:p-7
      "
    >
      {/* Subtle decorative glow */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          -right-24
          h-52
          w-52
          rounded-full
          bg-cyan-50
          blur-3xl
          transition-all
          duration-500
          group-hover:bg-cyan-100
        "
      />

      <div className="relative">
        {/* Header */}

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Icon */}

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-cyan-500
                text-white
                shadow-md
                shadow-cyan-200/60
              "
            >
              <LogIn size={19} strokeWidth={2.2} />
            </div>

            {/* Title */}

            <div className="min-w-0">
              <h2
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-slate-950
                "
              >
                Join meeting
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Enter an existing meeting
              </p>
            </div>
          </div>

          {/* Quick join */}

          <div
            className="
              hidden
              shrink-0
              items-center
              gap-1.5
              rounded-full
              border
              border-cyan-100
              bg-cyan-50
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-cyan-600
              sm:flex
            "
          >
            <Zap size={11} />
            Quick join
          </div>
        </div>

        {/* Description */}

        <p
          className="
            mt-6
            max-w-lg
            text-sm
            leading-6
            text-slate-500
          "
        >
          Enter the meeting ID shared by your host to join the conversation
          instantly.
        </p>

        {/* Form */}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="meeting-id"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Meeting ID
            </label>

            <Input
              id="meeting-id"
              type="text"
              value={meetingId}
              onChange={(event) =>
                setMeetingId(event.target.value.toUpperCase())
              }
              placeholder="e.g. A82F19C3"
              maxLength={20}
              disabled={isJoining}
              autoComplete="off"
              spellCheck="false"
              className="
                h-12
                rounded-xl
                border-slate-200
                bg-slate-50/70
                px-4
                font-mono
                text-sm
                font-semibold
                tracking-wider
                text-slate-900
                shadow-none
                transition
                placeholder:font-sans
                placeholder:font-normal
                placeholder:tracking-normal
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-500/10
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <p className="mt-2 text-xs text-slate-400">
              Meeting IDs are not case-sensitive.
            </p>
          </div>

          {/* Button */}

          <Button
            type="submit"
            disabled={isDisabled}
            className="
    h-12
    w-full
    rounded-xl
    bg-cyan-500
    px-5
    text-sm
    font-semibold
    text-white
    shadow-md
    shadow-cyan-200/50
    transition-all
    duration-200
    hover:-translate-y-0.5
    hover:bg-cyan-600
    hover:shadow-lg
    hover:shadow-cyan-200/60
    focus:ring-4
    focus:ring-cyan-500/20
    disabled:translate-y-0
    disabled:cursor-not-allowed
    disabled:opacity-50
    disabled:shadow-none
    cursor-pointer
  "
          >
            {isJoining ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Joining meeting...
              </>
            ) : (
              <>
                Join meeting
                <ArrowRight size={17} />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default JoinMeeting;
