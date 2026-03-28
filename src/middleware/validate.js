import { sendError } from "../utils/apiResponse.js";

/**
 * Joi validation middleware factory.
 * pass a Joi schema and it returns a middleware that validates req.body.
 * 
 * Usage:
 * router.post("/register", validate(registerSchema), register)
 * 
 * @param {import("joi").ObjectSchema} schema
 */

const validate = (schema) => (req, res, next) => {
    const {error, value} = schema.validate(req.body, {
        abortEarly: false, // return all errors at once, not just the first
        stripUnknown: true, //remove fields not defined in schema
        convert: true, //auto-convert types e.g. "25" to 25
    });

    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message.replace(/['"]/g, ""),
        }));
        return sendError(res, 400, "Validation failed", errors);
    }

    // Replace req.body with the validated + sanitized value
    req.body = value;
    next();
};

export default validate;