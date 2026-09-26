import { CheckCircle2, Home, RotateCcw } from "lucide-react";

const MeetingEnded = ({ meetingId, onReturnHome, onRejoin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md text-center">
          {/* SUCCESS ICON */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>

          {/* TITLE */}
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
            Meeting ended
          </h1>

          {/* DESCRIPTION */}
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
            You have left the meeting successfully. Thanks for using
            ConnectMeet.
          </p>

          {/* MEETING ID */}
          {meetingId && (
            <div className="mx-auto mt-6 max-w-xs rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Meeting ID
              </p>

              <p className="mt-1 truncate font-mono text-sm text-slate-300">
                {meetingId}
              </p>
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {onRejoin && (
              <button
                type="button"
                onClick={onRejoin}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-5
                  text-sm
                  font-medium
                  text-white
                  transition-colors
                  hover:bg-slate-800
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-indigo-500
                "
              >
                <RotateCcw size={16} />
                Rejoin
              </button>
            )}

            <button
              type="button"
              onClick={onReturnHome}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-5
                text-sm
                font-medium
                text-white
                transition-colors
                hover:bg-indigo-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-indigo-500
              "
            >
              <Home size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingEnded;
