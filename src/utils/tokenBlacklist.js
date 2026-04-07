import jwt from "jsonwebtoken";
import { BlacklistedToken } from "../models/User.js";

/**
 * Add a token to the blacklist.
 * Automatically sets expiry to match the token's own expiry
 * so MongoDB cleans it up when it's no longer needed
 */



export const blacklistToken = async (token) => {
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000) // JWT exp is in seconds, convert to ms
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days if no exp claim

    await BlacklistedToken.create({ token, expiresAt });
};

/**
 * Check if a token has been blacklisted.
 */
export const isBlacklisted = async (token) => {
    const found = await BlacklistedToken.findOne({ token });
    return !!found;
};