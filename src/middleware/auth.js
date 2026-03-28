import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError } from "../utils/apiResponse.js";
import { JWT_SECRET_KEY } from "../config/env";



export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
        return sendError(res, 401, "Not authorized, token missing");

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id).select ("-password");
        if (!req.user)
            return sendError(res, 401, "User no longer exists");
        next();
    } catch (error) {
        return sendError(res, 401, "Not authorized, token invalid");
    }
});

// Restrict to specific roles
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return sendError(res, 403, `Role '${req.user.role}' is not authorized for this action`);
    }
    next();
};