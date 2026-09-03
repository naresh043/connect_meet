import { Users, X, User, Mic, MicOff, VideoOff } from "feather-icons-react";

import {
  getRemoteCameraStatus,
  getRemoteMicStatus,
} from "../../utils/meetingUtils";

const ParticipantPanel = ({
  currentUser,
  remoteUsers,
  remoteStreams,
  isMuted,
  isCameraOff,
  onClose,
}) => {
  const remoteCount = Object.keys(remoteUsers || {}).length;

  const participantCount = 1 + remoteCount;

  return (
    <>
      {/* MOBILE BACKDROP */}

      <div
        className="fixed inset-0 z-[90] bg-black/50 sm:hidden"
        onClick={onClose}
      />

      {/* PANEL */}

      <div className="fixed top-0 right-0 bottom-0 sm:top-20 sm:right-4 sm:bottom-auto z-[100] w-full sm:w-80 max-w-sm">
        <div className="h-full sm:h-auto bg-gray-900 sm:border sm:border-gray-700 sm:rounded-2xl shadow-2xl overflow-hidden">
          {/* HEADER */}

          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
            <div>
              <h2 className="font-semibold">Participants</h2>

              <p className="text-xs text-gray-400 mt-1">
                {participantCount}{" "}
                {participantCount === 1 ? "person" : "people"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-800"
            >
              <X size={19} />
            </button>
          </div>

          {/* LIST */}

          <div className="overflow-y-auto max-h-[calc(100vh-80px)] sm:max-h-96">
            {/* CURRENT USER */}

            <ParticipantRow
              name={currentUser?.name || "You"}
              email={currentUser?.email}
              isYou
              muted={isMuted}
              cameraOff={isCameraOff}
            />

            {/* REMOTE USERS */}

            {Object.entries(remoteUsers || {}).map(
              ([socketId, participant]) => {
                const stream = remoteStreams?.[socketId];

                return (
                  <ParticipantRow
                    key={socketId}
                    name={participant?.name || "Participant"}
                    email={participant?.email}
                    muted={getRemoteMicStatus(participant, stream)}
                    cameraOff={getRemoteCameraStatus(participant, stream)}
                  />
                );
              },
            )}

            {/* EMPTY */}

            {remoteCount === 0 && (
              <div className="text-center py-8 px-4">
                <Users size={24} className="mx-auto text-gray-600 mb-2" />

                <p className="text-sm text-gray-400">
                  You are the only participant
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/*
=====================================================
PARTICIPANT ROW
=====================================================
*/

const ParticipantRow = ({
  name,
  email,
  isYou = false,
  muted = false,
  cameraOff = false,
}) => {
  const avatar = (name || "P").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
      {/* AVATAR */}

      <div
        className={`
          w-11
          h-11
          rounded-full
          flex
          items-center
          justify-center
          flex-shrink-0
          ${isYou ? "bg-blue-600" : "bg-slate-700"}
        `}
      >
        {avatar ? (
          <span className="font-semibold">{avatar}</span>
        ) : (
          <User size={18} />
        )}
      </div>

      {/* USER INFO */}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{name}</p>

          {isYou && (
            <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">
              You
            </span>
          )}
        </div>

        {email && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
        )}
      </div>

      {/* MEDIA STATUS */}

      <div className="flex items-center gap-2 flex-shrink-0">
        {muted ? (
          <MicOff size={16} className="text-red-400" />
        ) : (
          <Mic size={16} className="text-gray-300" />
        )}

        {cameraOff && <VideoOff size={16} className="text-red-400" />}
      </div>
    </div>
  );
};

export default ParticipantPanel;
