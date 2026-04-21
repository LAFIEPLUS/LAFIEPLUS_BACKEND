import SymptomSession from "../models/SymptomSession.js";
import asyncHandler from "../utils/asyncHandler.js"
import { sendError, sendSuccess } from "../utils/apiResponse.js"
import Consultation from "../models/Consultation.js"
import { UserModel } from "../models/User.js";
import { sendConsultationAcceptedEmail, sendConsultationMessageEmail } from "../utils/emailService.js";
import Referral from "../models/Referral.js";

/**
 * Same rules as getConsultations for partners: pending (unassigned) items in their specialty
 * queue, or assigned/active items where they are partnerId.
 */
function partnerCanAccessPendingQueue(reqUser, consultation) {
    if (reqUser.role !== "partner" || consultation.status !== "pending") return false;
    const assigned = consultation.partnerId?._id ?? consultation.partnerId;
    if (assigned && assigned.toString() !== reqUser._id.toString()) return false;
    const specialty = reqUser.partnerInfo?.specialty;
    if (specialty && specialty !== "general") {
        return consultation.specialty === specialty;
    }
    return true;
}

function canAccessConsultation(reqUser, consultation) {
    const uid = reqUser._id.toString();
    const ownerId = consultation.userId?._id?.toString() ?? consultation.userId?.toString();
    const partnerId = consultation.partnerId?._id?.toString() ?? consultation.partnerId?.toString();
    const isOwner = ownerId === uid;
    const isAssignedPartner = partnerId === uid;
    if (isOwner || isAssignedPartner || reqUser.role === "admin") return true;
    return partnerCanAccessPendingQueue(reqUser, consultation);
}

// @desc   Open a consultation request
// @route  POST /api/consultations
// @access Private (user)
export const createConsultation = asyncHandler(async (req, res) => {
    const { concern, specialty = "general", symptomSessionId } = req.body;

    if (symptomSessionId) {
        const session = await SymptomSession.findOne({
            _id: symptomSessionId,
            userId: req.user._id
        });
        if (!session)
            return sendError(res, 404, "Symptom session not found");
    }

    const consultation = await Consultation.create({
        userId: req.user._id,
        concern,
        specialty,
        symptomSessionId: symptomSessionId || undefined,
    });

    if (symptomSessionId) {
        await SymptomSession.findByIdAndUpdate(symptomSessionId, { consultationId: consultation._id });
    }

    sendSuccess(res, 201, "Consultation request submitted A helath partner will respond shortly.", {
        consultation,
    });
});

// @desc   List consultations
// @route  GET /api/consultations
// @access Private (user sees own, partner sees assigned + pending, admin sees all)
export const getConsultations = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    if (req.user.role === "user") {
        filter.userId = req.user._id;
    } else if (req.user.role === "partner") {
        const specialty = req.user.partnerInfo?.specialty;
        filter.$or = [
            { partnerId: req.user._id },
            {
                status: "pending",
                ...(specialty && specialty !== "general" ? { specialty } : {}),
            },
        ];
    }

    const [consultations, total] = await Promise.all([
        Consultation.find(filter)
            .populate("userId", "name phone email healthProfile")
            .populate("partnerId", "name partnerInfo")
            .select("-messages")
            .skip(skip).limit(limit).sort("-createdAt"),
        Consultation.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Consultations fetched", {
        consultations,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc   Get single consultation with messages
// @route  GET /api/consultations/:id
// @access Private (participant or admin)
export const getConsultation = asyncHandler(async (req, res) => {
    const consultation = await Consultation.findById(req.params.id)
        .populate("userId", "name phone email healthProfile")
        .populate("partnerId", "name partnerInfo")
        .populate("symptomSessionId", "symptoms riskLevel aiResponse")
        .populate("referralId");

    if (!consultation) return sendError(res, 404, "Consultation not found");

    if (!canAccessConsultation(req.user, consultation)) {
        return sendError(res, 403, "Access denied");
    }

    sendSuccess(res, 200, "Consultation fetched", { consultation });
});

// @desc   Partner accepts a consultation
// @route  PATCH /api/consultations/:id/accept
// @access Private (partner)
export const acceptConsultation = asyncHandler(async (req, res) => {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return sendError(res, 404, "Consultation not found");
    if (consultation.status !== "pending") return sendError(res, 400, `Consultation is already ${consultation.status}`);

    consultation.partnerId = req.user._id;
    consultation.status = "active";
    consultation.acceptedAt = new Date();
    consultation.expiresAt = undefined; // cancel TTL
    await consultation.save();

    await UserModel.findByIdAndUpdate(req.user._id, { $inc: { "partnerInfo.consultationCount": 1 } });

    const patient = await UserModel.findById(consultation.userId);
    if (patient?.email) {
        sendConsultationAcceptedEmail({
            name: patient.name,
            email: patient.email,
            partnerName: req.user.name,
            consultationId: consultation._id,
        }).catch((e) => console.error("Accepted email failed:", e.message));
    }

    const populated = await Consultation.findById(consultation._id)
        .populate("userId", "name email phone")
        .populate("partnerId", "name partnerInfo");

    sendSuccess(res, 200, "Consultation accepted", { consultation: populated });
});

// @desc   Send a message in the consultation thread
// @route  POST /api/consultations/:id/messages
// @access Private (participant)
export const sendMessage = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation)
        return sendError(res, 404, "Consultation not found");
    if (consultation.status !== "active")
        return sendError(res, 400, "Consultation is not active");

    const isParticipant =
        consultation.userId.toString() === req.user._id.toString() ||
        consultation.partnerId?.toString() === req.user._id.toString();

    if (!isParticipant) return sendError(res, 403, "Access denied");

    consultation.messages.push({ senderId: req.user._id, content, sentAt: new Date() });
    await consultation.save();

    const newMsg = consultation.messages[consultation.messages.length - 1];

    // Notify the other participant
    const recipientId = consultation.userId.toString() === req.user._id.toString()
        ? consultation.partnerId
        : consultation.userId;

    if (recipientId) {
        const recipient = await UserModel.findById(recipientId);
        if (recipient?.email) {
            sendConsultationMessageEmail({
                name: recipient.name,
                email: recipient.email,
                senderName: req.user.name,
                consultationId: consultation._id,
            }).catch((e) => console.error("Message email failed:", e.message));
        }
    }

    sendSuccess(res, 201, "Message sent", { message: newMsg });
});

// @desc   Get paginated messages
// @route  GET /api/consultations/:id/messages
// @access Private (participant or admin)
export const getMessages = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);

    const consultation = await Consultation.findById(req.params.id)
        .select("messages userId partnerId status specialty");

    if (!consultation) return sendError(res, 404, "Consultation not found");

    const canReadMessages =
        consultation.userId.toString() === req.user._id.toString() ||
        consultation.partnerId?.toString() === req.user._id.toString() ||
        req.user.role === "admin" ||
        partnerCanAccessPendingQueue(req.user, consultation);

    if (!canReadMessages)
        return sendError(res, 403, "Access denied");

    const total = consultation.messages.length;
    const skip = (page - 1) * limit;
    const messages = consultation.messages.slice(skip, skip + limit);

    // Mark unread messages as read (fire and forget)
    const unread = consultation.messages.filter(
        (m) => !m.readAt && m.senderId.toString() !== req.user._id.toString()
    );
    if (unread.length > 0) {
        unread.forEach((m) => { m.readAt = new Date(); });
        consultation.save().catch(console.error);
    }

    sendSuccess(res, 200, "Messages fetched", {
        messages,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc   Partner closes the consultation
// @route  PATCH /api/consultations/:id/close
// @access Private (partner)
export const closeConsultation = asyncHandler(async (req, res) => {
    const { closureNotes, createReferral, facilityId, referralReason, urgency = "routine" } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation)
        return sendError(res, 404, "Consultation not found");
    if (consultation.status !== "active")
        return sendError(res, 400, "Consultation is not active");
    if (consultation.partnerId?.toString() !== req.user._id.toString()) {
        return sendError(res, 403, "Only the assigned partner can close this consultation");
    }

    consultation.status = "closed";
    consultation.closureNotes = closureNotes;
    consultation.closedAt = new Date();

    if (createReferral && facilityId) {
        const referral = await Referral.create({
            userId: consultation.userId,
            facilityId,
            issuedBy: req.user._id,
            consultationId: consultation._id,
            reason: referralReason || closureNotes,
            urgency,
        });
        consultation.referralId = referral._id;
    }

    await consultation.save();
    sendSuccess(res, 200, "Consultation closed", { consultation });
});

// @desc   Cancel a consultation
// @route  PATCH /api/consultations/:id/cancel
// @access Private (owner or admin)
export const cancelConsultation = asyncHandler(async (req, res) => {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation)
        return sendError(res, 404, "Consultation not found");
    if (!["pending", "active"].includes(consultation.status)) {
        return sendError(res, 400, `Cannot cancel a ${consultation.status} consultation`);
    }

    const isOwner = consultation.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin")
        return sendError(res, 403, "Access denied");

    consultation.status = "cancelled";
    consultation.expiresAt = undefined;
    await consultation.save();

    sendSuccess(res, 200, "Consultation cancelled");
});