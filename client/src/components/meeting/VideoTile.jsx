import { useEffect, useRef } from "react";

const VideoTile = ({ stream, name, muted = false, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-xl overflow-hidden min-h-[250px]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />

      <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
        {name}
        {isLocal && " (You)"}
      </div>
    </div>
  );
};

export default VideoTile;
