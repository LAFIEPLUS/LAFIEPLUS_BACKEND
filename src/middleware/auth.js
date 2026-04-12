import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError } from "../utils/apiResponse.js";
import { JWT_SECRET_KEY } from "../config/env.js";
import { isBlacklisted } from "../utils/tokenBlacklist.js";
import { hasPermission } from "../config/roles.js";



export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
        return sendError(res, 401, "Not authorized, token missing");

    if (await isBlacklisted(token)) {
        return sendError(res, 401, "Session expired, Please login again");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = await UserModel.findById(decoded.id).select ("-password");
        req.token = token; // attach token to request for logout blacklisting

        if (!req.user)
            return sendError(res, 401, "User no longer exists");
        if (!req.user.isActive)
            return sendError(res, 403, "Account is has been deactivated. Please contact support.");
        next();
    } catch (error) {
        return sendError(res, 401, "Not authorized, token invalid");
    }
});

// --- authorize
// Restrict to specific roles
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return sendError(res, 403, `Access denied. Required role: ${roles.join(" or ")}`);
    }
    next();
};

//--- can
// Restricts access based on a specific permission
// Usage: can(PERMISSIONS.MANAGE_FACILITIES)
export const can = (permission) => (req, res, next) => {
    if (!hasPermission(req.user.role, permission)) {
        return sendError(res, 403, "Access denied. Insufficient permissions.");
    }
    next();
};

//---canAny
// Passes if user has ANY of the listed permissions
// Usage: canAny(PERMISSIONS.UPDATE_HEALTH_CONTENT, PERMISSIONS.DELETE_HEALTH_CONTENT)
export const canAny = (...permissions) => (req, res, next) => {
    const allowed = permissions.some((p) => hasPermission (req.user.role, p));
    if (!allowed) {
        return sendError(res, 403, "Access denied. You need at least one of the following permissions: " + permissions.join(", "));
    }
    next();
}

// ─── optionalAuth — attaches user if token present, never blocks ──
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer")) {
      const token = authHeader.split(" ")[1];
      if (!isBlacklisted(token)) {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
      }
    }
  } catch (_) { /* ignore */ }
  next();
});