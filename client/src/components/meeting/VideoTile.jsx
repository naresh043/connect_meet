import { Mic, MicOff, VideoOff } from "feather-icons-react";

import { useEffect, useRef } from "react";

const VideoTile = ({
  stream,
  name = "Participant",
  muted = false,
  isLocal = false,
  isCameraOff = false,
  isMuted = false,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    if (stream && !isCameraOff) {
      videoRef.current.srcObject = stream;
    } else {
      videoRef.current.srcObject = null;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream, isCameraOff]);

  const getInitial = () => {
    if (!name) {
      return "P";
    }

    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-video border border-slate-700">
      {/* VIDEO */}

      {!isCameraOff && stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      )}

      {/* AVATAR */}

      {isCameraOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-700 flex items-center justify-center shadow-lg">
            <span className="text-3xl sm:text-4xl font-semibold text-white">
              {getInitial()}
            </span>
          </div>
        </div>
      )}

      {/* NAME */}

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm max-w-[75%]">
          <span className="truncate block">
            {name}
            {isLocal && " (You)"}
          </span>
        </div>

        {/* MIC */}

        <div className="bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg">
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </div>
      </div>

      {/* CAMERA OFF */}

      {isCameraOff && (
        <div className="absolute top-3 right-3 bg-black/70 text-white rounded-lg p-2">
          <VideoOff size={16} />
        </div>
      )}
    </div>
  );
};

export default VideoTile;
