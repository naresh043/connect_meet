import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Video, ArrowUpRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createMeeting } from "../../features/meetings/meetingSlice";

const CreateMeeting = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCreating } = useSelector((state) => state.meetings);

  const [title, setTitle] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle || isCreating) {
      return;
    }

    const result = await dispatch(createMeeting(cleanTitle));

    if (createMeeting.fulfilled.match(result)) {
      const meeting = result.payload.meeting;

      navigate(`/meeting/${meeting.meetingId}`);
    }
  };

  const isDisabled = isCreating || !title.trim();

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
        hover:border-indigo-200
        hover:shadow-md
        hover:shadow-indigo-100/40
        sm:p-7
      "
    >
      {/* Subtle decorative glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-52
          w-52
          rounded-full
          bg-indigo-50
          blur-3xl
          transition-all
          duration-500
          group-hover:bg-indigo-100
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
                bg-indigo-600
                text-white
                shadow-md
                shadow-indigo-200/60
              "
            >
              <Video size={19} strokeWidth={2.2} />
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
                Create meeting
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Start a new video session
              </p>
            </div>
          </div>

          {/* New badge */}

          <div
            className="
              hidden
              shrink-0
              items-center
              gap-1.5
              rounded-full
              border
              border-indigo-100
              bg-indigo-50
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-indigo-600
              sm:flex
            "
          >
            <Sparkles size={11} />
            New
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
          Give your meeting a recognizable name and start connecting with your
          participants.
        </p>

        {/* Form */}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="meeting-title"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Meeting title
            </label>

            <Input
              id="meeting-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Product team sync"
              maxLength={100}
              disabled={isCreating}
              autoComplete="off"
              className="
                h-12
                rounded-xl
                border-slate-200
                bg-slate-50/70
                px-4
                text-sm
                font-medium
                text-slate-900
                shadow-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-400
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-500/10
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Choose a recognizable name
              </span>

              <span
                className={
                  title.length >= 90
                    ? "text-xs font-semibold text-amber-500"
                    : "text-xs text-slate-400"
                }
              >
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Button */}

   <Button
  type="submit"
  disabled={isDisabled}
  className="
    h-12
    w-full
    rounded-xl
    bg-indigo-600
    px-5
    text-sm
    font-semibold
    text-white
    shadow-md
    shadow-indigo-200/50
    transition-all
    duration-200
    hover:-translate-y-0.5
    hover:bg-indigo-700
    hover:shadow-lg
    hover:shadow-indigo-200/60
    focus:ring-4
    focus:ring-indigo-500/20
    disabled:translate-y-0
    disabled:cursor-not-allowed
    disabled:opacity-50
    disabled:shadow-none
    cursor-pointer
  "
>
  {isCreating ? (
    <>
      <Loader2 size={17} className="animate-spin" />
      Creating meeting...
    </>
  ) : (
    <>
      Create meeting
      <ArrowUpRight size={17} />
    </>
  )}
</Button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeeting;
