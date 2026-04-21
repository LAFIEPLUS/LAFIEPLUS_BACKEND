import Referral from "../models/Referral.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const VALID_TRANSITIONS = {
    pending: ["accepted", "cancelled"],
    accepted: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

// @desc   Create referral
// @route  POST /api/referrals
// @access Private (user, partner, admin)
export const createReferral = asyncHandler(async (req, res) => {
    const { userId, facilityId, reason, urgency, consultationId, appointmentDate, notes } = req.body;

    const targetUserId = req.user.role !== "user" ? userId : req.user._id.toString();

    const referral = await Referral.create({
        userId: targetUserId, facilityId, issuedBy: req.user._id,
        reason, urgency, consultationId, appointmentDate, notes,
    });

    const populated = await Referral.findById(referral._id)
        .populate("userId", "name phone email")
        .populate("facilityId", "name type address phone")
        .populate("issuedBy", "name role");

    sendSuccess(res, 201, "Referral created", { referral: populated });
});

// @desc   List referrals
// @route  GET /api/referrals
// @access Private
export const getReferrals = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.urgency) filter.urgency = req.query.urgency;

    if (req.user.role === "user") filter.userId = req.user._id;
    else if (req.user.role === "partner") filter.issuedBy = req.user._id;

    const [referrals, total] = await Promise.all([
        Referral.find(filter)
            .populate("userId", "name phone email")
            .populate("facilityId", "name type address phone")
            .populate("issuedBy", "name role")
            .skip(skip).limit(limit).sort("-createdAt"),
        Referral.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Referrals fetched", {
        referrals,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});


// @desc   Get single referral
// @route  GET /api/referrals/:id
// @access Private (owner, issuer, or admin)
export const getReferral = asyncHandler(async (req, res) => {
    const referral = await Referral.findById(req.params.id)
        .populate("userId", "name phone email")
        .populate("facilityId", "name type address phone operatingHours")
        .populate("issuedBy", "name role partnerInfo")
        .populate("consultationId", "concern closureNotes");

    if (!referral) return sendError(res, 404, "Referral not found");

    const isOwner = referral.userId._id.toString() === req.user._id.toString();
    const isIssuer = referral.issuedBy._id.toString() === req.user._id.toString();

    if (!isOwner && !isIssuer && req.user.role !== "admin") return sendError(res, 403, "Access denied");

    sendSuccess(res, 200, "Referral fetched", { referral });
});

// @desc   Update referral status
// @route  PATCH /api/referrals/:id/status
// @access Private (partner, admin)
export const updateReferralStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const referral = await Referral.findById(req.params.id);
    if (!referral) return sendError(res, 404, "Referral not found");

    if (!VALID_TRANSITIONS[referral.status].includes(status)) {
        return sendError(res, 400, `Cannot transition from ${referral.status} to ${status}`);
    }

    referral.status = status;
    referral.statusHistory.push({ status, changedBy: req.user._id, note });
    await referral.save();

    sendSuccess(res, 200, `Referral status updated to ${status}`, { referral });
});