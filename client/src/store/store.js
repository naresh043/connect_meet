import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import meetingReducer from "../features/meetings/meetingSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    meetings: meetingReducer,
  },
});

export default store;