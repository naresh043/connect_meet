const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["host", "participant"],
      default: "participant",
    },

    joinedAt: {
      type: Date,
      default: null,
    },

    leftAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate participant records for the same meeting/user
participantSchema.index({ meeting: 1, user: 1 }, { unique: true });

const Participant = mongoose.model("Participant", participantSchema);

module.exports = Participant;
