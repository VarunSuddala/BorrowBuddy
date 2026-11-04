const mongoose = require("mongoose");

const reminderLogSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reminderType: {
      type: String,
      enum: ["one_day_before", "due_today", "overdue"],
      required: true,
    },
    inAppSentAt: Date,
    inAppClaimedAt: Date,
  },
  { timestamps: true }
);

reminderLogSchema.index({ loanId: 1, reminderType: 1 }, { unique: true });

module.exports =
  mongoose.models.ReminderLog || mongoose.model("ReminderLog", reminderLogSchema);
