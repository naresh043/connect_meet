import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Copy,
  Phone,
} from "feather-icons-react";

const MeetingControls = ({
  isMuted,
  isCameraOff,
  onToggleMic,
  onToggleCamera,
  onLeave,
  onParticipants,
}) => {
  /*
  =====================================================
  COPY MEETING LINK
  =====================================================
  */

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      alert("Meeting link copied!");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-2">
        {/* MICROPHONE */}

        <button
          onClick={onToggleMic}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
            isMuted
              ? "bg-red-600 text-white"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* CAMERA */}

        <button
          onClick={onToggleCamera}
          title={isCameraOff ? "Turn camera on" : "Turn camera off"}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
            isCameraOff
              ? "bg-red-600 text-white"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
        >
          {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        {/* PARTICIPANTS */}

        <button
          onClick={onParticipants}
          title="Participants"
          className="w-12 h-12 rounded-xl bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center"
        >
          <Users size={20} />
        </button>

        {/* COPY */}

        <button
          onClick={copyMeetingLink}
          title="Copy meeting link"
          className="w-12 h-12 rounded-xl bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center"
        >
          <Copy size={20} />
        </button>

        {/* LEAVE */}

        <button
          onClick={onLeave}
          title="Leave meeting"
          className="w-12 h-12 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center ml-2"
        >
          <Phone size={20} />
        </button>
      </div>
    </div>
  );
};

export default MeetingControls;
