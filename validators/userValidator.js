import Joi from "joi";
import { ROLES } from "../src/config/roles.js";


export const updateProfileSchema = Joi.object({
  name:  Joi.string().min(2).max(50),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase(),
  phone: Joi.string().pattern(/^\+?[\d\s\-().]{7,20}$/),

  healthProfile: Joi.object({
    age:    Joi.number().integer().min(0).max(120),
    gender: Joi.string().valid("male", "female", "other", "prefer_not_to_say"),
    healthPreferences: Joi.array().items(Joi.string()).max(10),
  }),

  partnerInfo: Joi.object({
    organizationName: Joi.string().max(100),
    contactPerson:    Joi.string().max(100),
  }),

  privacySettings: Joi.object({
    shareAnonymousData: Joi.boolean(),
  }),
}).min(1).message("Provide at least one field to update");

export const notifyUserSchema = Joi.object({
  subject: Joi.string().min(2).max(100).required()
    .messages({ "any.required": "Subject is required" }),
  message: Joi.string().min(5).max(2000).required()
    .messages({ "any.required": "Message is required" }),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required()
    .messages({
      "any.only":     `Role must be one of: ${Object.values(ROLES).join(", ")}`,
      "any.required": "Role is required",
    }),
});
