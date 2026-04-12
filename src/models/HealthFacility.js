import mongoose from "mongoose";

const healthFacilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["clinic", "hospital", "pharmacy", "lab", "chw"],
    },
    // GeoJSON Point — required for $near queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address:        { type: String, required: true },
    phone:          String,
    email:          String,
    website:        String,
    services:       [String],
    operatingHours: mongoose.Schema.Types.Mixed,
    isActive:       { type: Boolean, default: true },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// 2dsphere index — mandatory for geospatial queries
healthFacilitySchema.index({ location: "2dsphere" });
healthFacilitySchema.index({ type: 1, isActive: 1 });
healthFacilitySchema.index({ name: "text" });

export default mongoose.model("HealthFacility", healthFacilitySchema);
