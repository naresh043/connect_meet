import { memo, useEffect, useRef } from "react";
import { Mic, MicOff, VideoOff } from "lucide-react";

const VIDEO_CLASS = `
  h-full
  w-full
  bg-slate-950
  object-cover
`;

const TILE_CLASS = `
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
`;

const GRADIENT_CLASS = `
  pointer-events-none
  absolute
  inset-x-0
  bottom-0
  h-24
  bg-gradient-to-t
  from-black/70
  to-transparent
`;

const LABEL_CLASS = `
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
`;

const ICON_BUTTON_CLASS = `
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
`;

const VideoTile = ({
  stream,
  name = "Participant",
  muted = false,
  isLocal = false,
  isCameraOff = false,
  isMuted = false,
}) => {
  const videoRef = useRef(null);

  /*
   * Attach the MediaStream directly to the video element.
   *
   * We intentionally don't put isCameraOff in this dependency list.
   * The video element remains mounted and we only attach/detach the
   * actual stream when necessary.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.srcObject = stream || null;

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "P";

  const videoClassName = `
    ${VIDEO_CLASS}
    ${isLocal ? "scale-x-[-1]" : ""}
    ${isCameraOff ? "opacity-0" : "opacity-100"}
  `;

  return (
    <div className={TILE_CLASS}>
      {/* VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        aria-label={`${name}${isLocal ? " (You)" : ""} video`}
        className={videoClassName}
      />

      {/* CAMERA OFF AVATAR */}
      {isCameraOff && (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-slate-900
          "
          aria-label={`${name} camera is off`}
        >
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
              {initial}
            </span>
          </div>
        </div>
      )}

      {/* BOTTOM GRADIENT */}
      <div className={GRADIENT_CLASS} />

      {/* NAME + MICROPHONE */}
      <div
        className="
          absolute
          bottom-3
          left-3
          right-3
          flex
          items-center
          justify-between
          gap-3
        "
      >
        {/* NAME */}
        <div className={LABEL_CLASS}>
          <span className="truncate font-medium">
            {name}
            {isLocal && " (You)"}
          </span>
        </div>

        {/* MICROPHONE */}
        <div
          className={`
            ${ICON_BUTTON_CLASS}
            ${
              isMuted
                ? "bg-red-500/90 text-white"
                : "bg-black/55 text-slate-200"
            }
          `}
          aria-label={isMuted ? "Microphone muted" : "Microphone active"}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
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
          aria-label="Camera off"
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

export default memo(VideoTile);