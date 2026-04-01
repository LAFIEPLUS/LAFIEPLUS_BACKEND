import Joi from "joi";
import { ROLES } from "../src/config/roles.js";

const passwordField = Joi.string()
  .min(6)
  .max(100)
  .required()
  .messages({
    "string.min":   "Password must be at least 6 characters",
    "any.required": "Password is required",
  });

const emailField = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .messages({ "string.email": "Please provide a valid email address" });

const phoneField = Joi.string()
  .pattern(/^\+?[\d\s\-().]{7,20}$/)
  .messages({ "string.pattern.base": "Please provide a valid phone number" });

// Register — must have email OR phone, not necessarily both
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({
      "string.min":   "Name must be at least 2 characters",
      "any.required": "Name is required",
    }),

  email: emailField,
  phone: phoneField,

  password: passwordField,

  role: Joi.string()
    .valid(ROLES.USER, ROLES.PARTNER) // admin can only be created by another admin
    .default(ROLES.USER)
    .messages({ "any.only": "Role must be user or partner" }),

  // Optional health profile fields on registration
  healthProfile: Joi.object({
    age:    Joi.number().integer().min(0).max(120),
    gender: Joi.string().valid("male", "female", "other", "prefer_not_to_say"),
    healthPreferences: Joi.array().items(Joi.string()).max(10),
  }).optional(),

  // Optional partner info
  partnerInfo: Joi.object({
    organizationName: Joi.string().max(100),
    contactPerson:    Joi.string().max(100),
  }).optional(),

}).or("email", "phone") // at least one of email or phone required
  .messages({ "object.missing": "Either email or phone number is required" });

export const loginSchema = Joi.object({
  email:    emailField.optional(),
  phone:    phoneField.optional(),
  password: Joi.string().required().messages({ "any.required": "Password is required" }),
}).or("email", "phone")
  .messages({ "object.missing": "Either email or phone number is required" });

export const forgotPasswordSchema = Joi.object({
  email: emailField.required().messages({ "any.required": "Email is required" }),
});

export const resetPasswordSchema = Joi.object({
  password: passwordField,
});