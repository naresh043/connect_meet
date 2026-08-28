const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    // Unique meeting ID that users share
    meetingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    },

    // Meeting status
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },

    // Lock meeting so new users cannot join
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
