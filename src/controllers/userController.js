import mongoose from "mongoose";
import { deleteFromCloudinary } from "../config/cloudinary.js";
import { UserModel } from "../models/User.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendContactEmail } from "../utils/emailService.js";

// --- Helper function to validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get own profile
// @route   GET /api/users/profile
// @access  Private (all roles)
export const getMyProfile = asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "User Profile fetched successfully", {
        user: req.user
    });
});

// @desc    Get all users (paginated)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.role ? { role: req.query.role } : {};

    const [users, total] = await Promise.all([
        UserModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        UserModel.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Users fetched successfully", {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id))
        return sendError(res, 400, "Invalid user ID");

    const user = await UserModel.findById(req.params.id);
    if (!user)
        return sendError(res, 404, "User not found");
    sendSuccess(res, 200, "User fetched", { user });
});

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = [
        "name",
        "email",
        "phone",
        "healthProfile",
        "partnerInfo",
        "privacySettings",
    ]

    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
    );
    sendSuccess(res, 200, "Profile updated", { user });
});

// @desc    Update a user's role
// @route   PUT /api/users/:id/role
// @access  Admin
export const updateUserRole = asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id))
        return sendError(res, 400, "Invalid user ID");

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
        return sendError(res, 400, "You cannot change your own role");
    }

    const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true, runValidators: true }
    );

    if (!user)
        return sendError(res, 404, "User not found");
    sendSuccess(res, 200, `User role updated to ${user.role}`, { user });
});

// @desc    Activate or deactivate a user account
// @route   PUT /api/users/:id/status
// @access  Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id))
        return sendError(res, 400, "Invalid user ID");

    if (req.params.id === req.user._id.toString()) {
        return sendError(res, 400, "You cannot change your own status");
    }

    const user = await UserModel.findById(req.params.id);
    if (!user)
        return sendError(res, 404, "User not found");

    user.isActive = req.body.isActive;
    await user.save();

    sendSuccess(res, 200, `User account has been ${user.isActive ? "activated" : "deactivated"}`, {
        user: { id: user._id, name: user.name, isActive: user.isActive },
    });
});

// @desc    Upload / replace user avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file)
        return sendError(res, 400, "No file uploaded");

    const user = await UserModel.findById(req.user._id);
    if (!user)
        return sendError(res, 404, "User not found");

    // If user already has an avatar, delete the old one from cloud storage
    if (user.avatar?.publicId) {
        await deleteFromCloudinary(user.avatar.publicId).catch((err) =>
            console.error("Failed to delete old avatar from cloud storage:", err.message)
        );
    }

    user.avatar = {
        url: req.file.path,
        publicId: req.file.filename,
    };
    await user.save();

    sendSuccess(res, 200, "Avatar uploaded", { avatar: user.avatar });

});

// @desc    Delete user avatar
// @route   DELETE /api/users/avatar
// @access  Private
export const deleteAvatar = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (!user.avatar?.publicId)
        return sendError(res, 400, "No avatar to delete");

    await deleteFromCloudinary(user.avatar.publicId);
    user.avatar = { url: null, publicId: null };
    await user.save();

    sendSuccess(res, 200, "Avatar deleted successfully");
});

// @desc    Send contact email to a user (admin)
// @route   POST /api/users/:id/notify
// @access  Private/Admin
export const notifyUser = asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id))
        return sendError(res, 400, "Invalid user ID");

    const user = await UserModel.findById(req.params.id);
    if (!user)
        return sendError(res, 404, "User not found");
    if (!user.email)
        return sendError(res, 400, "User does not have an email address");

    const { subject, message } = req.body;
    if (!subject || !message)
        return sendError(res, 400, "Subject and message are required");
    await sendContactEmail({
        name: user.name,
        email: user.email,
        subject,
        message,
    });

    sendSuccess(res, 200, "Email sent successfully");
});

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id))
        return sendError(res, 400, "Invalid user ID");
    if (req.params.id === req.user._id.toString()) {
        return sendError(res, 400, "You cannot delete your own account");
    }

    const user = await UserModel.findById(req.params.id);
    if (!user)
        return sendError(res, 404, "User not found");

    if (user.avatar?.publicId) {
        await deleteFromCloudinary(user.avatar.publicId).catch((err) =>
            console.error("Failed to delete user's avatar from cloud storage:", err.message)
        );
    }

    await user.deleteOne();
    sendSuccess(res, 200, "User deleted successfully");
});