import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

const PreJoinMeeting = ({ meetingId, currentUser, onJoin }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [mediaError, setMediaError] = useState("");
  const [hasMedia, setHasMedia] = useState(false);

  /*
   * =====================================================
   * USER INFORMATION
   * =====================================================
   */

  const userName = currentUser?.name || "You";

  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

  /*
   * =====================================================
   * STOP MEDIA STREAM
   * =====================================================
   */

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setHasMedia(false);
  }, []);

  /*
   * =====================================================
   * MEDIA ERROR MESSAGE
   * =====================================================
   */

  const getMediaErrorMessage = (error) => {
    switch (error?.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return {
          title: "Permission required",
          message:
            "Camera and microphone access was blocked. Allow access in your browser settings and try again.",
        };

      case "NotFoundError":
      case "DevicesNotFoundError":
        return {
          title: "No device found",
          message:
            "We couldn't find a camera or microphone connected to this device.",
        };

      case "NotReadableError":
      case "TrackStartError":
        return {
          title: "Device is busy",
          message:
            "Your camera or microphone may already be in use by another application.",
        };

      case "OverconstrainedError":
        return {
          title: "Device unavailable",
          message:
            "Your camera doesn't support the requested settings. Try another camera or refresh the page.",
        };

      case "SecurityError":
        return {
          title: "Secure connection required",
          message: "Camera and microphone access requires HTTPS or localhost.",
        };

      default:
        return {
          title: "Unable to access devices",
          message:
            "We couldn't start your camera or microphone. Please check your device and try again.",
        };
    }
  };

  /*
   * =====================================================
   * INITIALIZE CAMERA + MICROPHONE
   * =====================================================
   */

  const initializeMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsRetrying(true);
      setMediaError("");

      /*
       * Stop an existing stream before requesting
       * another one.
       */

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
      }

      setHasMedia(false);

      /*
       * Browser support check
       */

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMediaError(
          "Your browser does not support camera and microphone access.",
        );

        setIsLoading(false);
        setIsRetrying(false);

        return;
      }

      /*
       * Request camera + microphone.
       */

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
          facingMode: "user",
        },
        audio: true,
      });

      /*
       * Component may have unmounted while waiting
       * for permission.
       */

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        return;
      }

      streamRef.current = stream;

      setHasMedia(true);
      setMediaError("");
      setIsLoading(false);
      setIsRetrying(false);

      /*
       * Attach stream after state update.
       *
       * The video element stays mounted, so this is
       * safe even while the loading UI is displayed.
       */

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (error) {
          /*
           * Autoplay can occasionally fail depending
           * on browser/device policy. Since the video
           * is muted, this is normally harmless.
           */

          console.debug("Preview autoplay:", error?.message);
        }
      }
    } catch (error) {
      console.error("Pre-join media error:", error);

      if (!mountedRef.current) {
        return;
      }

      const errorInfo = getMediaErrorMessage(error);

      setMediaError(`${errorInfo.title}: ${errorInfo.message}`);

      setIsLoading(false);
      setIsRetrying(false);
      setHasMedia(false);
    }
  }, []);

  /*
   * =====================================================
   * INITIAL MEDIA
   * =====================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    initializeMedia();

    return () => {
      mountedRef.current = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [initializeMedia]);

  /*
   * =====================================================
   * KEEP VIDEO CONNECTED
   * =====================================================
   */

  useEffect(() => {
    if (!videoRef.current || !streamRef.current) {
      return;
    }

    if (isCameraOff || mediaError) {
      videoRef.current.srcObject = null;
      return;
    }

    videoRef.current.srcObject = streamRef.current;
  }, [isCameraOff, mediaError, hasMedia]);

  /*
   * =====================================================
   * MICROPHONE
   * =====================================================
   */

  const toggleMicrophone = () => {
    const audioTracks = streamRef.current?.getAudioTracks() || [];

    if (!audioTracks.length) {
      return;
    }

    const currentlyEnabled = audioTracks[0].enabled;

    const nextMuted = currentlyEnabled;

    audioTracks.forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);
  };

  /*
   * =====================================================
   * CAMERA
   * =====================================================
   */

  const toggleCamera = () => {
    const videoTracks = streamRef.current?.getVideoTracks() || [];

    if (!videoTracks.length) {
      return;
    }

    const currentlyEnabled = videoTracks[0].enabled;

    const nextCameraOff = currentlyEnabled;

    videoTracks.forEach((track) => {
      track.enabled = !nextCameraOff;
    });

    setIsCameraOff(nextCameraOff);
  };

  /*
   * =====================================================
   * RETRY
   * =====================================================
   */

  const handleRetry = () => {
    setIsMuted(false);
    setIsCameraOff(false);

    initializeMedia();
  };

  /*
   * =====================================================
   * JOIN MEETING
   * =====================================================
   */

  const handleJoin = () => {
    if (!streamRef.current || !hasMedia || isJoining) {
      return;
    }

    setIsJoining(true);

    /*
     * Preserve the selected media state.
     *
     * The actual meeting room creates its own
     * WebRTC stream through useWebRTC().
     */

    const joinSettings = {
      isMuted,
      isCameraOff,
    };

    /*
     * Stop preview stream.
     */

    streamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setHasMedia(false);

    onJoin(joinSettings);
  };

  const mediaReady = hasMedia && !isLoading && !mediaError;

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-slate-950
        px-3
        py-6
        text-white
        sm:px-6
        sm:py-8
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          -top-40
          h-96
          w-96
          rounded-full
          bg-indigo-600/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -right-40
          h-96
          w-96
          rounded-full
          bg-cyan-600/10
          blur-3xl
        "
      />

      <div className="relative w-full max-w-4xl">
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="mb-5 flex items-center justify-center gap-2.5 sm:mb-6">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-indigo-600
              text-white
              shadow-lg
              shadow-indigo-950/40
            "
          >
            <Video size={18} />
          </div>

          <span className="text-lg font-bold tracking-tight">ConnectMeet</span>
        </div>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            shadow-2xl
            shadow-black/30
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              border-b
              border-slate-800
              px-4
              py-4
              sm:px-6
            "
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight sm:text-lg">
                    Ready to join?
                  </h1>

                  {mediaReady && (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  )}
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Check your camera and microphone before entering the meeting.
                </p>
              </div>

              {/* DESKTOP MEETING ID */}

              <div
                className="
                  hidden
                  shrink-0
                  rounded-lg
                  border
                  border-slate-800
                  bg-slate-950
                  px-3
                  py-2
                  sm:block
                "
              >
                <p className="text-[10px] uppercase tracking-wide text-slate-600">
                  Meeting ID
                </p>

                <p className="mt-0.5 font-mono text-xs text-slate-300">
                  {meetingId}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="grid lg:grid-cols-[1fr_300px]">
            {/* =================================================
                VIDEO PREVIEW
            ================================================= */}

            <div className="p-4 sm:p-6">
              <div
                className="
                  relative
                  aspect-video
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-950
                  shadow-inner
                "
              >
                {/* =================================================
                    VIDEO
                ================================================= */}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label="Camera preview"
                  className={`
  h-full
  w-full
  object-cover
  transition-opacity
  duration-300
  ${
    isCameraOff || isLoading || Boolean(mediaError)
      ? "opacity-0"
      : "opacity-100"
  }
`}
                />

                {/* =================================================
                    LOADING SKELETON
                ================================================= */}

                {isLoading && !mediaError && (
                  <div className="absolute inset-0 bg-slate-950">
                    {/* Skeleton video background */}

                    <Skeleton
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        rounded-none
                        bg-slate-900
                      "
                    />

                    {/* Center loading indicator */}

                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        flex-col
                        items-center
                        justify-center
                      "
                    >
                      <div
                        className="
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-slate-700
                          bg-slate-900/90
                        "
                      >
                        <Loader2
                          size={25}
                          className="
                            animate-spin
                            text-indigo-400
                          "
                        />
                      </div>

                      <p className="mt-4 text-sm font-medium text-slate-300">
                        Starting camera...
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Requesting camera and microphone access
                      </p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    CAMERA OFF
                ================================================= */}

                {!isLoading && isCameraOff && !mediaError && (
                  <div
                    className="
                        absolute
                        inset-0
                        flex
                        flex-col
                        items-center
                        justify-center
                        bg-slate-950
                      "
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
                          shadow-xl
                          shadow-indigo-950/40
                          sm:h-24
                          sm:w-24
                        "
                    >
                      <span className="text-3xl font-bold sm:text-4xl">
                        {userInitial}
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-400">
                      Your camera is off
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Turn it on before joining if you want to use video
                    </p>
                  </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {!isLoading && mediaError && (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      flex-col
                      items-center
                      justify-center
                      bg-slate-950
                      px-5
                      text-center
                      sm:px-8
                    "
                  >
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        text-red-400
                      "
                    >
                      <AlertCircle size={22} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-white">
                      Camera or microphone unavailable
                    </h3>

                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                      {mediaError}
                    </p>

                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="
                        mt-5
                        inline-flex
                        h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-700
                        bg-slate-800
                        px-4
                        text-xs
                        font-semibold
                        text-slate-200
                        transition
                        hover:border-slate-600
                        hover:bg-slate-700
                        cursor-pointer
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {isRetrying ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={15} />
                          Try again
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* =================================================
                    NAME
                ================================================= */}

                {!mediaError && (
                  <div
                    className="
                      absolute
                      bottom-3
                      left-3
                      rounded-lg
                      border
                      border-white/10
                      bg-black/60
                      px-3
                      py-2
                      text-xs
                      font-medium
                      backdrop-blur-md
                      sm:text-sm
                    "
                  >
                    {userName} (You)
                  </div>
                )}

                {/* =================================================
                    READY STATUS
                ================================================= */}

                {mediaReady && (
                  <div
                    className="
                      absolute
                      right-3
                      top-3
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-emerald-400/20
                      bg-emerald-500/90
                      px-2.5
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-white
                      shadow-lg
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Ready
                  </div>
                )}
              </div>

              {/* =================================================
                  PREVIEW CONTROLS
              ================================================= */}

              <div className="mt-4 flex items-center justify-center gap-3">
                {/* MICROPHONE */}

                <button
                  type="button"
                  onClick={toggleMicrophone}
                  disabled={isLoading || Boolean(mediaError)}
                  title={isMuted ? "Turn microphone on" : "Turn microphone off"}
                  aria-label={
                    isMuted ? "Turn microphone on" : "Turn microphone off"
                  }
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    transition-all
                    duration-200
                    ${
                      isMuted
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }
                    ${
                      isLoading || mediaError
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
                </button>

                {/* CAMERA */}

                <button
                  type="button"
                  onClick={toggleCamera}
                  disabled={isLoading || Boolean(mediaError)}
                  title={isCameraOff ? "Turn camera on" : "Turn camera off"}
                  aria-label={
                    isCameraOff ? "Turn camera on" : "Turn camera off"
                  }
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    transition-all
                    duration-200
                    ${
                      isCameraOff
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }
                    ${
                      isLoading || mediaError
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {isCameraOff ? <VideoOff size={19} /> : <Video size={19} />}
                </button>
              </div>
            </div>

            {/* =================================================
                JOIN INFORMATION
            ================================================= */}

            <div
              className="
                border-t
                border-slate-800
                bg-slate-950/50
                p-5
                sm:p-6
                lg:border-l
                lg:border-t-0
              "
            >
              {/* PROFILE */}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Your profile
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-indigo-600
                      text-white
                    "
                  >
                    <span className="font-semibold">{userInitial}</span>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {userName}
                    </p>

                    {currentUser?.email && (
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  MEDIA STATUS
              ================================================= */}

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Before joining
                </p>

                <div className="mt-3 space-y-3">
                  <StatusItem
                    icon={isMuted ? <MicOff size={15} /> : <Mic size={15} />}
                    label="Microphone"
                    value={isMuted ? "Off" : "On"}
                    danger={isMuted}
                    loading={isLoading}
                  />

                  <StatusItem
                    icon={
                      isCameraOff ? <VideoOff size={15} /> : <Video size={15} />
                    }
                    label="Camera"
                    value={isCameraOff ? "Off" : "On"}
                    danger={isCameraOff}
                    loading={isLoading}
                  />
                </div>
              </div>

              {/* =================================================
                  JOIN BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={handleJoin}
                disabled={!mediaReady || isJoining}
                className="
                  mt-8
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-md
                  shadow-indigo-950/30
                  transition-all
                  duration-200
                  cursor-pointer
                  hover:-translate-y-0.5
                  hover:bg-indigo-700
                  hover:shadow-lg
                  focus:outline-none
                  focus:ring-4
                  focus:ring-indigo-500/20
                  disabled:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:shadow-none
                "
              >
                {isJoining ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Meeting
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">
                You can change your camera and microphone settings after
                joining.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            MOBILE MEETING ID
        ================================================= */}

        <div className="mt-4 text-center sm:hidden">
          <span className="text-[10px] uppercase tracking-wider text-slate-600">
            Meeting ID
          </span>

          <p className="mt-1 font-mono text-xs text-slate-500">{meetingId}</p>
        </div>
      </div>
    </div>
  );
};

/*
 * =====================================================
 * STATUS ITEM
 * =====================================================
 */

const StatusItem = ({
  icon,
  label,
  value,
  danger = false,
  loading = false,
}) => {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-slate-800
        bg-slate-900
        px-3
        py-2.5
      "
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            ${
              danger
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }
          `}
        >
          {loading ? (
            <Skeleton className="h-4 w-4 rounded-md bg-slate-700" />
          ) : (
            icon
          )}
        </div>

        {loading ? (
          <Skeleton className="h-3.5 w-20 rounded-md bg-slate-800" />
        ) : (
          <span className="text-xs font-medium text-slate-400">{label}</span>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-3.5 w-8 rounded-md bg-slate-800" />
      ) : (
        <span
          className={`
            text-xs
            font-semibold
            ${danger ? "text-red-400" : "text-emerald-400"}
          `}
        >
          {value}
        </span>
      )}
    </div>
  );
};

export default PreJoinMeeting;
