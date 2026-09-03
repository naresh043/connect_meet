import VideoTile from "./VideoTile";

const VideoGrid = ({
  currentUser,
  localStream,
  remoteStreams,
  remoteUsers,
  isMuted,
  isCameraOff,
  meetingId,
}) => {
  const remoteCount = Object.keys(remoteUsers || {}).length;

  const totalParticipants = 1 + remoteCount;

  const getGridClass = () => {
    if (totalParticipants === 1) {
      return "grid-cols-1 max-w-6xl mx-auto";
    }

    if (totalParticipants === 2) {
      return "grid-cols-1 sm:grid-cols-2";
    }

    if (totalParticipants === 3) {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }

    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <main className="w-full px-3 sm:px-5 lg:px-6 py-4 sm:py-6 pb-28 sm:pb-32">
      <div
        className={`
          w-full
          grid
          gap-3
          sm:gap-4
          lg:gap-5
          ${getGridClass()}
        `}
      >
        {/* LOCAL */}
        {localStream && (
          <VideoTile
            stream={localStream}
            name={currentUser?.name || "You"}
            muted
            isLocal
            isCameraOff={isCameraOff}
            isMuted={isMuted}
          />
        )}

        {/* REMOTE */}
        {Object.entries(remoteUsers || {}).map(([socketId, participant]) => {
          const stream = remoteStreams?.[socketId];

          return (
            <VideoTile
              key={socketId}
              stream={stream}
              name={participant?.name || "Participant"}
              muted={false}
              isLocal={false}
              isCameraOff={Boolean(participant?.isCameraOff)}
              isMuted={Boolean(participant?.isMuted)}
            />
          );
        })}
      </div>

      {/* WAITING */}
      {remoteCount === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-400">Waiting for another participant...</p>

          <p className="text-gray-600 text-sm mt-2">Share this Meeting ID:</p>

          <div className="inline-block mt-2 bg-gray-800 px-4 py-2 rounded-lg font-mono">
            {meetingId}
          </div>
        </div>
      )}
    </main>
  );
};

export default VideoGrid;
