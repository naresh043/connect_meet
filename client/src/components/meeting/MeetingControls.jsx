const MeetingControls = ({
  isMuted,
  isCameraOff,
  onToggleMic,
  onToggleCamera,
  onLeave,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
      <button
        onClick={onToggleMic}
        className="px-5 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600"
      >
        {isMuted ? "🔇 Unmute" : "🎤 Mute"}
      </button>

      <button
        onClick={onToggleCamera}
        className="px-5 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600"
      >
        {isCameraOff ? "📷 Camera On" : "📹 Camera Off"}
      </button>

      <button
        onClick={onLeave}
        className="px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
      >
        📞 Leave
      </button>
    </div>
  );
};

export default MeetingControls;
