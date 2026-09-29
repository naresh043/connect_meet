const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    /*
     * null = message is currently retained indefinitely
     * until the meeting ends.
     *
     * After meeting ends:
     * expiresAt = endedAt + retention period
     */
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * Chat history query optimization.
 */
messageSchema.index({
  meeting: 1,
  createdAt: -1,
});

/*
 * MongoDB TTL index.
 *
 * expireAfterSeconds: 0 means:
 * delete the document when expiresAt is reached.
 *
 * Documents with expiresAt: null do not expire.
 */
messageSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
