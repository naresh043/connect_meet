import { Loader2, Wifi } from "lucide-react";

const MeetingLoading = ({
  title = "Connecting to meeting",
  message = "Please wait while we establish your connection...",
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm px-6 text-center">
        {/* ICON */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
          <div className="relative">
            <Wifi className="h-7 w-7 text-indigo-400" />

            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-white" />
            </span>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-lg font-semibold text-white">{title}</h2>

        {/* MESSAGE */}
        <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>

        {/* LOADING */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </div>
      </div>
    </div>
  );
};

export default MeetingLoading;
