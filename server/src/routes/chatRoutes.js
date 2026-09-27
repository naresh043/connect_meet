const express = require("express");

const {
  getChatMessages,
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET
 * /api/meetings/:meetingId/messages
 *
 * Authentication required.
 */
router.get(
  "/:meetingId/messages",
  authMiddleware,
  getChatMessages,
);

module.exports = router;