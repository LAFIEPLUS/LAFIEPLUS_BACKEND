import { UserModel } from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import Consultation from "../models/Consultation.js";
import Referral from "../models/Referral.js";


// @desc   List available partners (filterable by specialty)
// @route  GET /api/partners/available
// @access Private
export const getAvailablePartners = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {
        role: "partner",
        isActive: true,
        "partnerInfo.isAvailable": true,
    };
    if (req.query.specialty) filter["partnerInfo.specialty"] = req.query.specialty;

    const [partners, total] = await Promise.all([
        UserModel.find(filter)
            .select("name partnerInfo avatar createdAt")
            .skip(skip).limit(limit)
            .sort("-partnerInfo.consultationCount"),
        UserModel.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Available partners fetched", {
        partners,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc   Toggle own availability
// @route  PATCH /api/partners/availability
// @access Private (partner)
export const toggleAvailability = asyncHandler(async (req, res) => {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== "boolean")
        return sendError(res, 400, "isAvailable must be a boolean");

    const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        { $set: { "partnerInfo.isAvailable": isAvailable } },
        { new: true }
    );

    sendSuccess(res, 200, `You are now ${isAvailable ? "available" : "unavailable"} for consultations`, {
        isAvailable: user.partnerInfo.isAvailable,
    });
});

// @desc   Update partner profile (specialty, bio)
// @route  PATCH /api/partners/profile
// @access Private (partner)
export const updatePartnerProfile = asyncHandler(async (req, res) => {
    const { specialty, bio } = req.body;
    const updates = {};
    if (specialty !== undefined) 
        updates["partnerInfo.specialty"] = specialty;
    if (bio !== undefined) 
        updates["partnerInfo.bio"] = bio;

    const user = await UserModel.findByIdAndUpdate(
        req.user._id, { $set: updates }, { new: true, runValidators: true }
    );
    sendSuccess(res, 200, "Partner profile updated", { partnerInfo: user.partnerInfo });
});


// @desc Get Partner dashboard stats
// @route GET /api/partner/stats
// @access Private (partner)
export const getPartnerStats = asyncHandler(async (req, res) => {
    const [totalConsultations, activeConsultations, closedConsultations, totalReferrals] =
    await Promise.all([
        Consultation.countDocuments({partnerId: req.user._id}),
        Consultation.countDocuments({partnerId: req.user._id, status: "active"}),
        Consultation.countDocuments({partnerId: req.user._id, status: "closed"}),
        Referral.countDocuments({issuedBy: req.user._id}),
    ]);

    sendSuccess(res, 200, "Stats retrieved", {
        stats: {totalConsultations, activeConsultations, closedConsultations, totalReferrals}
    })
})