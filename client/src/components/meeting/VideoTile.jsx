import { Mic, MicOff, Video, VideoOff } from "feather-icons-react";

import { useEffect, useRef } from "react";

const VideoTile = ({
  stream,
  name = "Participant",
  muted = false,
  isLocal = false,
}) => {
  const videoRef = useRef(null);

  const videoEnabled = stream?.getVideoTracks()?.some((track) => track.enabled);

  const audioEnabled = stream?.getAudioTracks()?.some((track) => track.enabled);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-800 aspect-video border border-slate-700">
      {/* VIDEO */}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />

      {/* NO CAMERA */}

      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-3xl font-semibold">
              {name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* NAME */}

      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          <span>
            {name}
            {isLocal && " (You)"}
          </span>

          {audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
        </div>
      </div>

      {/* CAMERA STATUS */}

      {!videoEnabled && (
        <div className="absolute top-3 right-3 bg-black/70 rounded-lg p-2">
          <VideoOff size={16} />
        </div>
      )}
    </div>
  );
};

export default VideoTile;
