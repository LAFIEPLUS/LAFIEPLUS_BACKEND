import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, trim: true },
    sentAt:  { type: Date, default: Date.now },
    readAt:  Date,
  },
  { _id: true }
);

const consultationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "closed", "cancelled"],
      default: "pending",
      index: true,
    },
    concern: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    specialty: {
      type: String,
      enum: ["general", "maternal", "adolescent", "mental_health"],
      default: "general",
    },
    symptomSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SymptomSession",
    },
    // Embedded message thread
    messages: [messageSchema],
    // Closure
    closureNotes: String,
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },
    closedAt:   Date,
    acceptedAt: Date,
    // TTL auto-cancel: MongoDB deletes pending docs after 24 h
    // Cleared (unset) when a partner accepts
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

// Set expiresAt on creation so pending consultations auto-cancel after 24 h
consultationSchema.pre("save", function (next) {
  if (this.isNew && this.status === "pending" && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.model("Consultation", consultationSchema);
