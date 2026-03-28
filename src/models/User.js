import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";


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
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "clinician", "admin"],
        default: "user",
    },
    isActive: {
        type: Boolean,
        default: true,
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
