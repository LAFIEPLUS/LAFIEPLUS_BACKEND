import mongoose from "mongoose";

const healthArticleSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true },
    body:     { type: String, required: true },
    summary:  { type: String, maxlength: 300 },
    category: {
      type: String,
      required: true,
      enum: ["maternal", "adolescent", "preventive", "general"],
    },
    locale:     { type: String, required: true, default: "en" },
    tags:       [String],
    coverImage: String,
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: Date,
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Full-text search index
healthArticleSchema.index({ title: "text", body: "text", tags: "text" });
healthArticleSchema.index({ category: 1, locale: 1, status: 1 });

// Auto-set publishedAt when status becomes "published"
healthArticleSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.model("HealthArticle", healthArticleSchema);
