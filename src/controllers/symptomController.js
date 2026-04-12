import SymptomSession from "../models/SymptomSession.js";
import { aiSymptomCheck } from "../services/aiService.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// @desc   Check symptoms — AI-assisted assessment
// @route  POST /api/symptoms/check
// @access Private (user)
export const checkSymptoms = asyncHandler(async (req, res) => {
    const { symptoms } = req.body;
    const user = req.user;

    const userContext = {
        age: user.healthProfile?.age,
        gender: user.healthProfile?.gender,
        maternalStatus: user.healthProfile?.maternalStatus,
        locale: user.healthProfile?.locale || "en",
    };

    const aiResponse = await aiSymptomCheck(symptoms, userContext);

    const session = await SymptomSession.create({
        userId: user._id,
        symptoms,
        riskLevel: aiResponse.riskLevel,
        aiResponse: {
            summary: aiResponse.summary,
            nextSteps: aiResponse.nextSteps || [],
            preventiveTips: aiResponse.preventiveTips || [],
            seekCareImmediately: aiResponse.seekCareImmediately || false,
        },
        userContext,
    });

    sendSuccess(res, 201, "Symptom check complete", {
        sessionId: session._id,
        riskLevel: session.riskLevel,
        summary: session.aiResponse.summary,
        nextSteps: session.aiResponse.nextSteps,
        preventiveTips: session.aiResponse.preventiveTips,
        seekCareImmediately: session.aiResponse.seekCareImmediately,
        recommendConsultation: ["high", "emergency"].includes(session.riskLevel),
    });
});

// @desc   Get symptom check history
// @route  GET /api/symptoms/history
// @access Private (user)
export const getHistory = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
        SymptomSession.find({ userId: req.user._id })
            .skip(skip).limit(limit).sort("-createdAt").select("-userContext"),
        SymptomSession.countDocuments({ userId: req.user._id }),
    ]);

    sendSuccess(res, 200, "History fetched", {
        sessions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc   Get single session
// @route  GET /api/symptoms/history/:id
// @access Private (user)
export const getSession = asyncHandler(async (req, res) => {
    const session = await SymptomSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session)
        return sendError(res, 404, "Session not found");
    sendSuccess(res, 200, "Session fetched", { session });
});

// @desc   Get risk level definitions
// @route  GET /api/symptoms/risk-levels
// @access Public
export const getRiskLevels = asyncHandler(async (_req, res) => {
    sendSuccess(res, 200, "Risk levels", {
        riskLevels: [
            { level: "low", label: "Low risk", description: "Self-care measures recommended", color: "#1D9E75" },
            { level: "moderate", label: "Moderate risk", description: "Consider seeing a doctor soon", color: "#BA7517" },
            { level: "high", label: "High risk", description: "See a doctor urgently", color: "#D85A30" },
            { level: "emergency", label: "Emergency", description: "Seek immediate care now", color: "#E24B4A" },
        ],
    });
});
