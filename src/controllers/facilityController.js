import HealthFacility from "../models/HealthFacility.js";
import SymptomSession from "../models/SymptomSession.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const RISK_TO_TYPES = {
    emergency: ["hospital"],
    high: ["hospital", "clinic"],
    moderate: ["clinic", "chw"],
    low: ["chw", "pharmacy"],
};

// @desc   Get nearby facilities (geo query)
// @route  GET /api/facilities/nearby?lat=&lng=&radius=&type=
// @access Private
export const getNearby = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 10000, type } = req.query;
    if (!lat || !lng)
        return sendError(res, 400, "lat and lng are required");

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const geoFilter = {
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                $maxDistance: parseFloat(radius),
            },
        },
        isActive: true,
    };
    if (type) geoFilter.type = type;

    const facilities = await HealthFacility.find(geoFilter)
        .skip(skip)
        .limit(limit);

    sendSuccess(res, 200, "Nearby facilities fetched", { facilities });
});

// @desc   Suggest facilities based on symptom session risk level
// @route  GET /api/facilities/suggest?sessionId=&lat=&lng=
// @access Private
export const suggestFacilities = asyncHandler(async (req, res) => {
    const { sessionId, lat, lng, radius = 15000 } = req.query;

    if (!sessionId)
        return sendError(res, 400, "sessionId is required");
    if (!lat || !lng)
        return sendError(res, 400, "lat and lng are required");

    const session = await SymptomSession.findOne({ _id: sessionId, userId: req.user._id });
    if (!session)
        return sendError(res, 404, "Symptom session not found");

    const types = RISK_TO_TYPES[session.riskLevel] || ["clinic"];

    const facilities = await HealthFacility.find({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                $maxDistance: parseFloat(radius),
            },
        },
        type: { $in: types },
        isActive: true,
    }).limit(10);

    sendSuccess(res, 200, "Suggested facilities", {
        riskLevel: session.riskLevel,
        recommendedTypes: types,
        facilities,
    });
});

// @desc   Get single facility
// @route  GET /api/facilities/:id
// @access Public
export const getFacility = asyncHandler(async (req, res) => {
    const facility = await HealthFacility.findOne({ _id: req.params.id, isActive: true });

    if (!facility)
        return sendError(res, 404, "Facility not found");

    sendSuccess(res, 200, "Facility fetched", { facility });
});

// @desc   Create facility
// @route  POST /api/facilities
// @access Admin
export const createFacility = asyncHandler(async (req, res) => {
    const { name, type, coordinates, address, phone, email, services, operatingHours } = req.body;

    const facility = await HealthFacility.create({
        name, type, address, phone, email, services, operatingHours,
        location: { type: "Point", coordinates },
        addedBy: req.user._id,
    });

    sendSuccess(res, 201, "Facility created", { facility });
});

// @desc   Update facility
// @route  PUT /api/facilities/:id
// @access Admin
export const updateFacility = asyncHandler(async (req, res) => {
    const allowed = ["name", "type", "address", "phone", "email", "services", "operatingHours", "isActive"];

    const updates = {};

    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (req.body.coordinates) updates.location = { type: "Point", coordinates: req.body.coordinates };

    const facility = await HealthFacility.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    );
    if (!facility)
        return sendError(res, 404, "Facility not found");

    sendSuccess(res, 200, "Facility updated", { facility });
});