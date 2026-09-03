export const getRemoteCameraStatus = (
  participant,
  stream
) => {
  if (
    typeof participant?.isCameraOff ===
    "boolean"
  ) {
    return participant.isCameraOff;
  }

  if (
    typeof participant?.cameraOff ===
    "boolean"
  ) {
    return participant.cameraOff;
  }

  if (
    typeof participant?.isVideoOff ===
    "boolean"
  ) {
    return participant.isVideoOff;
  }

  if (
    typeof participant?.videoOff ===
    "boolean"
  ) {
    return participant.videoOff;
  }

  if (!stream) {
    return true;
  }

  return false;
};

export const getRemoteMicStatus = (
  participant,
  stream
) => {
  if (
    typeof participant?.isMuted ===
    "boolean"
  ) {
    return participant.isMuted;
  }

  if (
    typeof participant?.muted ===
    "boolean"
  ) {
    return participant.muted;
  }

  if (
    typeof participant?.micOff ===
    "boolean"
  ) {
    return participant.micOff;
  }

  if (
    typeof participant?.isMicOff ===
    "boolean"
  ) {
    return participant.isMicOff;
  }

  const audioTracks =
    stream?.getAudioTracks?.() || [];

  if (audioTracks.length === 0) {
    return true;
  }

  return audioTracks.every(
    (track) => !track.enabled
  );
};