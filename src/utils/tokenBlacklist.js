/**
 * In-memory token blacklist for logout.
 * Tokens are cleared every hour to prevent memory bloat.
 * For production scale, replace with Redis.
 */

const blacklist = new Set();

export const blacklistToken = (token) => blacklist.add(token);

export const isBlacklisted = (token) => blacklist.has(token);

// clear blacklistToken every hour
setInterval(() => {
    blacklist.clear();
    console.log("🗑️ Token blacklist cleared");
}, 60 * 60 * 1000);