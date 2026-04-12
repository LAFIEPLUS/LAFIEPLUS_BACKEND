import { ref, required } from "joi";
import mongoose from "mongoose";
import { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        sentAt: {
            type: Date,
            default: Date.now
        },
        readAt: Date,
    },
    { _id: true }
);

const consultationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        partnerId: {
            type: Schema.Types.ObjectId,
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
            enum: ["general", "maternal", "pediatrics", "mental_health"],
            defualt: "general",
        },
        symptomSessionId: {
            type: Schema.Types.ObjectId,
            ref: "SymptomSession",
        },
        // Embedded message thread
        message: [messageSchema],
        // Closure
        closureNotes: String,
        referralId: {
            type: Schema.Types.ObjectId,
            ref: "Referral",
        },
        closedAt: Date,
        acceptedAt: Date,

        // TTL auto-cancel: MongoDB deletes pending docs after 24hrs
        // Cleared (unset) when a partner accepts
        expiresAt: {
            type: Date,
            index: { expireAfterSeconds: 0 },
        },
    },
    { timestamps: true }
);

// Set expiresAt on creation so pending consultations auto-cancel after 24hrs
consultationSchema.pre("save", function (next) {
    if (this.isNew && this.status === "pending" && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    next();
});

export default mongoose.model("Consultation", consultationSchema);