import {
  Mic,
  MicOff,
  VideoOff,
  Volume2,
} from "lucide-react";

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
    <div
      className="
        group
        relative
        aspect-video
        overflow-hidden
        rounded-2xl
        border
        border-slate-700/80
        bg-slate-900
        shadow-lg
        shadow-black/20
      "
    >
      {/* VIDEO */}
      {!isCameraOff && stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="
            h-full
            w-full
            object-cover
            bg-slate-950
          "
        />
      )}

      {/* CAMERA OFF */}
      {isCameraOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div
            className="
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-indigo-600
              text-white
              shadow-xl
              shadow-indigo-950/40
              sm:h-24
              sm:w-24
            "
          >
            <span className="text-3xl font-bold sm:text-4xl">
              {getInitial()}
            </span>
          </div>
        </div>
      )}

      {/* SUBTLE BOTTOM GRADIENT */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-24
          bg-gradient-to-t
          from-black/70
          to-transparent
        "
      />

      {/* NAME + MIC */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
        {/* NAME */}
        <div
          className="
            flex
            min-w-0
            max-w-[75%]
            items-center
            gap-2
            rounded-lg
            border
            border-white/10
            bg-black/55
            px-3
            py-2
            text-sm
            text-white
            shadow-sm
            backdrop-blur-md
          "
        >
          <span className="truncate font-medium">
            {name}
            {isLocal && " (You)"}
          </span>
        </div>

        {/* MIC */}
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            border-white/10
            backdrop-blur-md
            ${
              isMuted
                ? "bg-red-500/90 text-white"
                : "bg-black/55 text-slate-200"
            }
          `}
        >
          {isMuted ? (
            <MicOff size={16} />
          ) : (
            <Mic size={16} />
          )}
        </div>
      </div>

      {/* CAMERA OFF INDICATOR */}
      {isCameraOff && (
        <div
          className="
            absolute
            right-3
            top-3
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-white/10
            bg-red-500/90
            text-white
            shadow-sm
          "
        >
          <VideoOff size={16} />
        </div>
      )}

      {/* LOCAL INDICATOR */}
      {isLocal && (
        <div
          className="
            absolute
            left-3
            top-3
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-emerald-400/20
            bg-emerald-500/90
            px-2.5
            py-1
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            text-white
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          You
        </div>
      )}
    </div>
  );
};

export default VideoTile;