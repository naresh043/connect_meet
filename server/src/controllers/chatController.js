const mongoose = require("mongoose");

const Message = require("../models/Message");
const Meeting = require("../models/Meeting");

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * =====================================================
 * GET CHAT HISTORY
 * =====================================================
 *
 * GET /api/meetings/:meetingId/messages
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
     * FIND MEETING
     * =====================================================
     */

    const meeting = await Meeting.findOne({
      meetingId: roomId,
    }).select("_id meetingId status host");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    /**
     * =====================================================
     * PARSE PAGINATION
     * =====================================================
     */

    const requestedLimit = Number.parseInt(req.query.limit, 10);

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

    /**
     * =====================================================
     * OPTIONAL CURSOR
     * =====================================================
     *
     * `before` contains a MongoDB message _id.
     *
     * Example:
     *
     * ?limit=50&before=665abc...
     */

    const before = req.query.before;

    const query = {
      meeting: meeting._id,
    };

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
     * CHECK MORE MESSAGES
     * =====================================================
     */

    const hasMore = messages.length > limit;

    if (hasMore) {
      messages.pop();
    }

    /**
     * =====================================================
     * RESTORE CHRONOLOGICAL ORDER
     * =====================================================
     */

    messages.reverse();

    /**
     * =====================================================
     * FORMAT RESPONSE
     * =====================================================
     */

    const formattedMessages = messages.map((message) => ({
      id: message._id.toString(),

      meetingId: meeting.meetingId,

      senderId: message.sender._id.toString(),

      senderName: message.sender.name || "Participant",

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
    next(error);
  }
};

module.exports = {
  getChatMessages,
};
