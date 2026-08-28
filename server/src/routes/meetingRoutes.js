const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createMeeting,
  getMyMeetings,
  getMeeting,
  joinMeeting,
  leaveMeeting,
  endMeeting,
  getParticipants,
  toggleMeetingLock,
} = require("../controllers/meetingController");

/*
=====================================================
ALL MEETING ROUTES REQUIRE AUTHENTICATION
=====================================================
*/

router.use(authMiddleware);

/*
=====================================================
MEETING ROUTES
=====================================================
*/

// Create meeting
router.post("/", createMeeting);

// Get my meetings
router.get("/", getMyMeetings);

// Get specific meeting
router.get("/:meetingId", getMeeting);

// Join meeting
router.post("/:meetingId/join", joinMeeting);

// Leave meeting
router.post("/:meetingId/leave", leaveMeeting);

// End meeting
router.delete("/:meetingId", endMeeting);

// Get participants
router.get("/:meetingId/participants", getParticipants);

// Lock / unlock meeting
router.patch("/:meetingId/lock", toggleMeetingLock);

module.exports = router;
