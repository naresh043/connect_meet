import { Users, Clock, Copy, Check, Link } from "feather-icons-react";

import { useState } from "react";

const MeetingHeader = ({
  meetingId,
  participantCount,
  isConnected,
  meetingTime,
  onParticipants,
}) => {
  const [copied, setCopied] = useState(null);

  const copyText = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(type);

      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const copyMeetingId = () => {
    copyText(meetingId, "id");
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${meetingId}`;

    copyText(link, "link");
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="px-3 sm:px-5 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* BRAND */}

          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-base sm:text-lg lg:text-xl truncate">
              ConnectMeet
            </h1>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] sm:text-xs text-gray-500">
                Meeting ID:
              </span>

              <span className="font-mono text-[10px] sm:text-xs text-gray-300 truncate">
                {meetingId}
              </span>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* CONNECTION */}

            <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-2 rounded-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />

              <span className="hidden md:inline text-xs text-gray-300">
                {isConnected ? "Connected" : "Connecting..."}
              </span>
            </div>

            {/* PARTICIPANTS */}

            <button
              type="button"
              onClick={onParticipants}
              className="h-9 min-w-9 px-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
              title="Participants"
            >
              <Users size={16} />

              <span className="text-xs sm:text-sm">{participantCount}</span>
            </button>

            {/* TIMER */}

            <div className="h-9 flex items-center gap-1.5 bg-gray-800 px-2.5 rounded-lg">
              <Clock size={15} />

              <span className="font-mono text-[11px] sm:text-xs">
                {meetingTime}
              </span>
            </div>
          </div>
        </div>

        {/* COPY BUTTONS */}

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={copyMeetingId}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-xs transition"
          >
            {copied === "id" ? (
              <>
                <Check size={15} />
                Copied
              </>
            ) : (
              <>
                <Copy size={15} />
                Copy ID
              </>
            )}
          </button>

          <button
            type="button"
            onClick={copyMeetingLink}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-xs transition"
          >
            {copied === "link" ? (
              <>
                <Check size={15} />
                Copied
              </>
            ) : (
              <>
                <Link size={15} />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default MeetingHeader;
