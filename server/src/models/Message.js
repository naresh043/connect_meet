const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Meeting this message belongs to
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },

    // User who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Message content
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

// Optimized for fetching chat history
messageSchema.index({
  meeting: 1,
  createdAt: -1,
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
