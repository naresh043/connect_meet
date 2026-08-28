import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import meetingService from "../../services/meetingService";

/*
=====================================================
INITIAL STATE
=====================================================
*/

const initialState = {
  meetings: [],
  currentMeeting: null,
  participants: [],

  isLoading: false,
  isCreating: false,
  isJoining: false,

  error: null,
};

/*
=====================================================
GET MY MEETINGS
=====================================================
*/

export const getMyMeetings = createAsyncThunk(
  "meetings/getMyMeetings",
  async (_, thunkAPI) => {
    try {
      return await meetingService.getMyMeetings();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch meetings",
      );
    }
  },
);

/*
=====================================================
CREATE MEETING
=====================================================
*/

export const createMeeting = createAsyncThunk(
  "meetings/createMeeting",
  async (title, thunkAPI) => {
    try {
      return await meetingService.createMeeting(title);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create meeting",
      );
    }
  },
);

/*
=====================================================
GET SINGLE MEETING
=====================================================
*/

export const getMeeting = createAsyncThunk(
  "meetings/getMeeting",
  async (meetingId, thunkAPI) => {
    try {
      return await meetingService.getMeeting(meetingId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Meeting not found",
      );
    }
  },
);

/*
=====================================================
JOIN MEETING
=====================================================
*/

export const joinMeeting = createAsyncThunk(
  "meetings/joinMeeting",
  async (meetingId, thunkAPI) => {
    try {
      return await meetingService.joinMeeting(meetingId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to join meeting",
      );
    }
  },
);

/*
=====================================================
LEAVE MEETING
=====================================================
*/

export const leaveMeeting = createAsyncThunk(
  "meetings/leaveMeeting",
  async (meetingId, thunkAPI) => {
    try {
      return await meetingService.leaveMeeting(meetingId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to leave meeting",
      );
    }
  },
);

/*
=====================================================
SLICE
=====================================================
*/

const meetingSlice = createSlice({
  name: "meetings",

  initialState,

  reducers: {
    clearMeetingError: (state) => {
      state.error = null;
    },

    clearCurrentMeeting: (state) => {
      state.currentMeeting = null;
      state.participants = [];
    },

    setCurrentMeeting: (state, action) => {
      state.currentMeeting = action.payload;
    },

    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
  },

  extraReducers: (builder) => {
    /*
    =================================================
    GET MY MEETINGS
    =================================================
    */

    builder
      .addCase(getMyMeetings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(getMyMeetings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings = action.payload.meetings;
      })

      .addCase(getMyMeetings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    /*
    =================================================
    CREATE MEETING
    =================================================
    */

    builder
      .addCase(createMeeting.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })

      .addCase(createMeeting.fulfilled, (state, action) => {
        state.isCreating = false;

        state.meetings.unshift(action.payload.meeting);

        state.currentMeeting = action.payload.meeting;
      })

      .addCase(createMeeting.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      });

    /*
    =================================================
    GET SINGLE MEETING
    =================================================
    */

    builder
      .addCase(getMeeting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(getMeeting.fulfilled, (state, action) => {
        state.isLoading = false;

        state.currentMeeting = action.payload.meeting;
      })

      .addCase(getMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    /*
    =================================================
    JOIN MEETING
    =================================================
    */

    builder
      .addCase(joinMeeting.pending, (state) => {
        state.isJoining = true;
        state.error = null;
      })

      .addCase(joinMeeting.fulfilled, (state, action) => {
        state.isJoining = false;

        state.currentMeeting = action.payload.meeting;
      })

      .addCase(joinMeeting.rejected, (state, action) => {
        state.isJoining = false;
        state.error = action.payload;
      });

    /*
    =================================================
    LEAVE MEETING
    =================================================
    */

    builder.addCase(leaveMeeting.fulfilled, (state) => {
      state.currentMeeting = null;
      state.participants = [];
    });
  },
});

export const {
  clearMeetingError,
  clearCurrentMeeting,
  setCurrentMeeting,
  setParticipants,
} = meetingSlice.actions;

export default meetingSlice.reducer;
