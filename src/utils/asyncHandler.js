/**
 * Wraps async route handlers - automatically passes errors to Express error middleware.
 * @param {Function} fn
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;