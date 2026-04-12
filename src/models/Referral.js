import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status:    String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note:      String,
  },
  { _id: false }
);

const referralSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthFacility",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
    },
    reason:  { type: String, required: true },
    urgency: {
      type: String,
      enum: ["routine", "urgent", "emergency"],
      default: "routine",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    statusHistory: [statusHistorySchema],
    notes:           String,
    appointmentDate: Date,
  },
  { timestamps: true }
);

// Push initial status into audit trail on creation
referralSchema.pre("save", function (next) {
  if (this.isNew) {
    this.statusHistory.push({ status: "pending", changedBy: this.issuedBy });
  }
  next();
});

export default mongoose.model("Referral", referralSchema);
