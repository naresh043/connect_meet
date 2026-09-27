const mongoose = require("mongoose");

const Message = require("../models/Message");
const Meeting = require("../models/Meeting");
const Participant = require("../models/Participant");

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * =====================================================
 * GET CHAT HISTORY
 * =====================================================
 *
 * GET /api/meetings/:meetingId/messages
 *
 * Authentication:
 * Required
 *
 * Authorization:
 * User must be a participant or host of the meeting.
 */

const getChatMessages = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    /**
     * =====================================================
     * VALIDATE MEETING ID
     * =====================================================
     */

    if (typeof meetingId !== "string" || !meetingId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Meeting ID is required.",
      });
    }

    const roomId = meetingId.trim();

    /**
     * =====================================================
     * GET AUTHENTICATED USER
     * =====================================================
     */

    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    /**
     * =====================================================
     * VALIDATE USER OBJECT ID
     * =====================================================
     */

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user.",
      });
    }

    /**
     * =====================================================
     * FIND MEETING
     * =====================================================
     */

    const meeting = await Meeting.findOne({
      meetingId: roomId,
    }).select("_id meetingId status");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    /**
     * =====================================================
     * VERIFY USER IS A MEETING PARTICIPANT
     * =====================================================
     */

    const participant = await Participant.findOne({
      meeting: meeting._id,
      user: userId,
    }).select("_id role");

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this meeting chat.",
      });
    }

    /**
     * =====================================================
     * PAGINATION
     * =====================================================
     */

    const requestedLimit = Number.parseInt(req.query.limit, 10);

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

    /**
     * =====================================================
     * BUILD MESSAGE QUERY
     * =====================================================
     */

    const query = {
      meeting: meeting._id,
    };

    /**
     * =====================================================
     * CURSOR PAGINATION
     * =====================================================
     *
     * Example:
     *
     * ?limit=50&before=MESSAGE_ID
     */

    const before = req.query.before;

    if (before) {
      if (!mongoose.Types.ObjectId.isValid(before)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message cursor.",
        });
      }

      const cursorMessage = await Message.findOne({
        _id: before,
        meeting: meeting._id,
      }).select("createdAt");

      if (!cursorMessage) {
        return res.status(400).json({
          success: false,
          message: "Invalid message cursor.",
        });
      }

      query.createdAt = {
        $lt: cursorMessage.createdAt,
      };
    }

    /**
     * =====================================================
     * FETCH MESSAGES
     * =====================================================
     */

    const messages = await Message.find(query)
      .sort({
        createdAt: -1,
      })
      .limit(limit + 1)
      .populate({
        path: "sender",
        select: "name",
      })
      .lean();

    /**
     * =====================================================
     * CHECK WHETHER MORE MESSAGES EXIST
     * =====================================================
     */

    const hasMore = messages.length > limit;

    if (hasMore) {
      messages.pop();
    }

    /**
     * =====================================================
     * CONVERT TO CHRONOLOGICAL ORDER
     * =====================================================
     */

    messages.reverse();

    /**
     * =====================================================
     * FORMAT FOR FRONTEND
     * =====================================================
     */

    const formattedMessages = messages.map((message) => ({
      id: message._id.toString(),

      meetingId: meeting.meetingId,

      senderId: message.sender?._id ? message.sender._id.toString() : "",

      senderName: message.sender?.name || "Participant",

      text: message.text,

      timestamp: message.createdAt.toISOString(),
    }));

    /**
     * =====================================================
     * NEXT CURSOR
     * =====================================================
     */

    const nextCursor =
      hasMore && formattedMessages.length > 0 ? formattedMessages[0].id : null;

    /**
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return res.status(200).json({
      success: true,

      data: {
        messages: formattedMessages,

        pagination: {
          limit,
          hasMore,
          nextCursor,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get chat history error:", error);

    next(error);
  }
};

module.exports = {
  getChatMessages,
};
