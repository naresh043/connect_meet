import httpClient from "./httpClient";

const meetingService = {
  // Create a new meeting
  createMeeting: async (title) => {
    const response = await httpClient.post(
      "/meetings",
      { title }
    );

    return response.data;
  },

  // Get meetings created by current user
  getMyMeetings: async () => {
    const response = await httpClient.get(
      "/meetings"
    );

    return response.data;
  },

  // Get a specific meeting
  getMeeting: async (meetingId) => {
    const response = await httpClient.get(
      `/meetings/${meetingId}`
    );

    return response.data;
  },

  // Join a meeting
  joinMeeting: async (meetingId) => {
    const response = await httpClient.post(
      `/meetings/${meetingId}/join`
    );

    return response.data;
  },

  // Leave meeting
  leaveMeeting: async (meetingId) => {
    const response = await httpClient.post(
      `/meetings/${meetingId}/leave`
    );

    return response.data;
  },

  // End meeting
  endMeeting: async (meetingId) => {
    const response = await httpClient.delete(
      `/meetings/${meetingId}`
    );

    return response.data;
  },

  // Get participants
  getParticipants: async (meetingId) => {
    const response = await httpClient.get(
      `/meetings/${meetingId}/participants`
    );

    return response.data;
  },

  // Lock/unlock meeting
  toggleMeetingLock: async (meetingId) => {
    const response = await httpClient.patch(
      `/meetings/${meetingId}/lock`
    );

    return response.data;
  },
};

export default meetingService;