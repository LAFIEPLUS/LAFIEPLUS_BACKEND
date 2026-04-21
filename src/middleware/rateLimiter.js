import rateLimit from "express-rate-limit";
import { NODE_ENV } from "../config/env.js";

const isTestLike = NODE_ENV === "development";
const apiWindowMs = Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const apiMax = Number(process.env.API_RATE_LIMIT_MAX || 100);
const authWindowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 200);
const disableRateLimit = process.env.DISABLE_RATE_LIMIT === "true";

export const apiLimiter = rateLimit({
    windowMs: apiWindowMs,
    max: apiMax,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { xForwardedForHeader: false },
    // Auth endpoints have their own limiter. Also disable in tests/when explicitly requested.
    skip: (req) => disableRateLimit || isTestLike || req.path.startsWith("/auth"),
    message: {success: false, message: "Too many requests, please try again later."},
});

export const authLimiter = rateLimit({
    windowMs: authWindowMs,
    max: authMax,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { xForwardedForHeader: false },
    skip: () => disableRateLimit || isTestLike,
    message: {success: false, message: "Too many login attempts, please try again later."},
});