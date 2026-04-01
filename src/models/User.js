import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ROLES } from "../config/roles.js";


const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxlenght: [50, "Name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        sparse: true, // Allows null (user may register without email) but enforces uniqueness if provided
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
        type: String,
        unique: true,
        sparse: true, // Allows null (user may register without phone) but enforces uniqueness if provided
        match: [/^\+?[\d\s\-().]{7, 20}$/, "Please enter a valid phone number"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.USER,
    },

    healthProfile: {
        age: { type: Number, min: [0, "Age cannot be negative"], max: 120 },
        gender: { type: String, enum: ["male", "female", "other", "Prefer not to say"] },
        medicalHistory: { type: [String], default: [] },
        medications: { type: [String], default: [] },
        allergies: { type: [String], default: [] },
    },
    partnerInfo: {
        partnerName: { type: String, trim: true, maxlenght: [100, "Partner name cannot exceed 100 characters"] },
        partnerPhone: {
            type: String,
            match: [/^\+?[\d\s\-().]{7, 20}$/, "Please enter a valid phone number"],
        },
        partnerEmail: {
            type: String,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    privacySettings: {
        shareAnonymousData: { type: Boolean, default: false },
        receivePromotionalEmails: { type: Boolean, default: true },
    },
    avatar: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Ensure at least one contact method is provided (email or phone)
userSchema.pre("validate", function (next) {
    if (!this.email && !this.phone) {
        return next(new Error("At least one contact method (email or phone) is required"));
    }
    next();
});

//Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare Passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate hashed reset token - returns raw token to send via email
userSchema.methods.getResetPasswordToken = function () {
    const rawToken = crypto.randomBytes(32).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return rawToken;
};

export const UserModel = model("User", userSchema);
