const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    // Unique meeting ID shared with participants
    meetingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // Meeting title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // User who created the meeting
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Meeting lifecycle status
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
      index: true,
    },

    // Prevent new users from joining
    isLocked: {
      type: Boolean,
      default: false,
    },

    // Meeting start time
    startedAt: {
      type: Date,
      default: null,
    },

    // Meeting end time
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
