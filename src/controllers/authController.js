import crypto from "crypto";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import { UserModel } from "../models/User.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import {
    sendPasswordResetConfirmationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
} from "../utils/emailService.js";
import { blacklistToken } from "../utils/tokenBlacklist.js";

// @desc    Register user + send welcome email
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role, healthProfile, partnerInfo } = req.body;

    const existingUser = await UserModel.findOne({
        $or: [
            ...(email ? [{ email }] : []),
            ... (phone ? [{ phone }] : []),
        ],
    });

    if (existingUser)
        return sendError(res, 409, "An account with that email or phone number already exists");

    const user = await UserModel.create({ name, email, password, phone, role, healthProfile, partnerInfo: role === "partner" ? partnerInfo : undefined });

    // if (email) {
    //     sendWelcomeEmail({ name: user.name, email: user.email })
    //     .then(() => console.log(`✅ Welcome email sent to ${email}`))
    //     .catch((err) =>
    //         console.error("welcome email failed:", err.message)
    //     );
    // }

    const token = generateToken(user._id);

    if (email) {
        try {
            await sendWelcomeEmail({ name: user.name, email: user.email })
            console.log(`✅ Welcome email sent to ${email}`)
        } catch (err) {
            console.error("❌ Welcome email failed:", err.message)
            // Don't return — registration still succeeds
        }
    }
    sendSuccess(res, 201, "Registraton successful", {
        token,
        user: {
            id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role
        },
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, phone, password } = req.body;
    const query = email ? { email } : { phone };
    const user = await UserModel.findOne(query).select("+password");
    

    if (!user || !(await user.matchPassword(password))) {
        return sendError(res, 401, "Invalid credentials");
    }
    if (!user.isActive)
        return sendError(res, 403, "Account is has been deactivated. Please contact support.");

    const token = generateToken(user._id);
    sendSuccess(res, 200, "Login successful", {
        token,
        user: {
            id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role
        },
    });

});

// @desc    Logout — invalidate token
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
    await blacklistToken(req.token);
    sendSuccess(res, 200, "Logged out successfully");
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "User Profile fetched successfully", {
        user: req.user
    });
});

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const user = await UserModel.findOne({
        email: req.body.email,
    });

    if (!user) {
        return sendSuccess(res, 200, "If an account with that email exists, a password reset link has been sent");
    }

    const rawToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
        await sendPasswordResetEmail({
            name: user.name,
            email: user.email,
            resetToken: rawToken,
        });
        sendSuccess(res, 200, "Password reset email sent successfully");
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        sendError(res, 500, "Failed to send password reset email. Please try again later.");
    }
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user)
        return sendError(res, 400, "Invalid or expired password reset token");

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();


    const token = generateToken(user._id);

    if (user.email) {
        try {
            await sendPasswordResetConfirmationEmail({ name: user.name, email: user.email });
            console.log(`✅ Password reset confirmation email sent to ${user.email}`);
        } catch (error) {
            console.error("❌ Failed to send password reset confirmation email:", error.message);
            // Don't return an error response since the password reset itself was successful
        }
    }

    sendSuccess(res, 200, "Password reset successful", { token });
});