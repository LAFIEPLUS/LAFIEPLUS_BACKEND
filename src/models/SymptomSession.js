import mongoose from "mongoose";

const symptomSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symptoms: { type: [String], required: true },
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high", "emergency"],
      required: true,
    },
    aiResponse: {
      summary:              { type: String, required: true },
      nextSteps:            [String],
      preventiveTips:       [String],
      seekCareImmediately:  { type: Boolean, default: false },
    },
    // Snapshot of user context at the time of the check
    userContext: {
      age:            Number,
      gender:         String,
      maternalStatus: String,
      locale:         String,
    },
    // Set if user proceeds to open a consultation from this session
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SymptomSession", symptomSessionSchema);
