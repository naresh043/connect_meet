const crypto = require("crypto");

const Meeting = require("../models/Meeting");
const Participant = require("../models/Participant");

/*
=====================================================
GENERATE UNIQUE MEETING ID
=====================================================
*/

const generateMeetingId = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

/*
=====================================================
CREATE MEETING
POST /api/meetings
PRIVATE
=====================================================
*/

const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Meeting title is required",
      });
    }

    // Generate meeting ID
    let meetingId;
    let existingMeeting;

    do {
      meetingId = generateMeetingId();

      existingMeeting = await Meeting.findOne({
        meetingId,
      });
    } while (existingMeeting);

    // Create meeting
    const meeting = await Meeting.create({
      meetingId,
      title: title.trim(),
      host: req.user.userId,
      status: "active",
      startedAt: new Date(),
    });

    // Add host as participant
    await Participant.create({
      meeting: meeting._id,
      user: req.user.userId,
      role: "host",
      joinedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meeting: {
        id: meeting._id,
        meetingId: meeting.meetingId,
        title: meeting.title,
        host: meeting.host,
        status: meeting.status,
        startedAt: meeting.startedAt,
        createdAt: meeting.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create meeting",
    });
  }
};

/*
=====================================================
GET ALL USER MEETINGS
GET /api/meetings
PRIVATE
=====================================================
*/

const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      host: req.user.userId,
    })
      .populate("host", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    console.error("Get Meetings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get meetings",
    });
  }
};

/*
=====================================================
GET MEETING BY ID
GET /api/meetings/:meetingId
PRIVATE
=====================================================
*/

const getMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({
      meetingId,
    }).populate("host", "name email");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    return res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Get Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get meeting",
    });
  }
};

/*
=====================================================
JOIN MEETING
POST /api/meetings/:meetingId/join
PRIVATE
=====================================================
*/

const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({
      meetingId,
    });

    // Meeting doesn't exist
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // Meeting already ended
    if (meeting.status === "ended") {
      return res.status(400).json({
        success: false,
        message: "This meeting has already ended",
      });
    }

    // Meeting is locked
    if (meeting.isLocked) {
      return res.status(403).json({
        success: false,
        message: "This meeting is locked",
      });
    }

    // Check if user already joined
    let participant = await Participant.findOne({
      meeting: meeting._id,
      user: req.user.userId,
    });

    if (participant) {
      // If participant previously left, update joined time
      participant.joinedAt = new Date();
      participant.leftAt = null;

      await participant.save();
    } else {
      participant = await Participant.create({
        meeting: meeting._id,
        user: req.user.userId,
        role: "participant",
        joinedAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Joined meeting successfully",
      meeting: {
        id: meeting._id,
        meetingId: meeting.meetingId,
        title: meeting.title,
        status: meeting.status,
      },
      participant: {
        id: participant._id,
        user: participant.user,
        role: participant.role,
        joinedAt: participant.joinedAt,
      },
    });
  } catch (error) {
    console.error("Join Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join meeting",
    });
  }
};

/*
=====================================================
LEAVE MEETING
POST /api/meetings/:meetingId/leave
PRIVATE
=====================================================
*/

const leaveMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({
      meetingId,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const participant = await Participant.findOne({
      meeting: meeting._id,
      user: req.user.userId,
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "You are not a participant of this meeting",
      });
    }

    participant.leftAt = new Date();

    await participant.save();

    return res.status(200).json({
      success: true,
      message: "Left meeting successfully",
    });
  } catch (error) {
    console.error("Leave Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to leave meeting",
    });
  }
};

/*
=====================================================
END MEETING
DELETE /api/meetings/:meetingId
PRIVATE - HOST ONLY
=====================================================
*/

const endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({
      meetingId,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // Check host
    if (meeting.host.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the meeting host can end the meeting",
      });
    }

    // Already ended
    if (meeting.status === "ended") {
      return res.status(400).json({
        success: false,
        message: "Meeting is already ended",
      });
    }

    meeting.status = "ended";
    meeting.endedAt = new Date();

    await meeting.save();

    // Mark active participants as left
    await Participant.updateMany(
      {
        meeting: meeting._id,
        leftAt: null,
      },
      {
        $set: {
          leftAt: new Date(),
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Meeting ended successfully",
      meeting: {
        meetingId: meeting.meetingId,
        status: meeting.status,
        endedAt: meeting.endedAt,
      },
    });
  } catch (error) {
    console.error("End Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to end meeting",
    });
  }
};

/*
=====================================================
GET PARTICIPANTS
GET /api/meetings/:meetingId/participants
PRIVATE
=====================================================
*/

const getParticipants = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({
      meetingId,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const participants = await Participant.find({
      meeting: meeting._id,
    })
      .populate("user", "name email")
      .sort({ joinedAt: 1 });

    return res.status(200).json({
      success: true,
      count: participants.length,
      participants,
    });
  } catch (error) {
    console.error("Get Participants Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get participants",
    });
  }
};

/*
=====================================================
LOCK / UNLOCK MEETING
PATCH /api/meetings/:meetingId/lock
PRIVATE - HOST ONLY
=====================================================
*/

const toggleMeetingLock = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({
      meetingId,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // Host check
    if (meeting.host.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the meeting host can lock or unlock the meeting",
      });
    }

    meeting.isLocked = !meeting.isLocked;

    await meeting.save();

    return res.status(200).json({
      success: true,
      message: meeting.isLocked
        ? "Meeting locked successfully"
        : "Meeting unlocked successfully",
      isLocked: meeting.isLocked,
    });
  } catch (error) {
    console.error("Toggle Meeting Lock Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update meeting lock",
    });
  }
};

module.exports = {
  createMeeting,
  getMyMeetings,
  getMeeting,
  joinMeeting,
  leaveMeeting,
  endMeeting,
  getParticipants,
  toggleMeetingLock,
};
