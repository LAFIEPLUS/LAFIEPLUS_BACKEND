import Joi from "joi";

// ─── Reusable health field definitions ────────────────────────────
export const healthFields = {
  weightKg:    Joi.number().min(2).max(500).precision(1),
  heightCm:    Joi.number().min(30).max(300).precision(1),
  age:         Joi.number().integer().min(0).max(120),
  systolic:    Joi.number().integer().min(60).max(300),
  diastolic:   Joi.number().integer().min(40).max(200),
  heartRate:   Joi.number().integer().min(20).max(300),
  bloodSugar:  Joi.number().min(1).max(100),
  temperature: Joi.number().min(30).max(45).precision(1),
  oxygenSat:   Joi.number().integer().min(50).max(100),
};

// ─── Symptom check ────────────────────────────────────────────────
export const symptomCheckSchema = Joi.object({
  symptoms: Joi.array().items(Joi.string().max(100)).min(1).max(20).required()
    .messages({
      "array.min":    "At least one symptom is required",
      "any.required": "Symptoms are required",
    }),
});

// ─── Health library article ───────────────────────────────────────
export const articleSchema = Joi.object({
  title:    Joi.string().min(5).max(200).required(),
  body:     Joi.string().min(50).required(),
  summary:  Joi.string().max(300),
  category: Joi.string().valid("maternal", "adolescent", "preventive", "general").required(),
  locale:   Joi.string().max(10).default("en"),
  tags:     Joi.array().items(Joi.string().max(50)),
  status:   Joi.string().valid("draft", "published", "archived"),
});

// ─── Consultation ─────────────────────────────────────────────────
export const consultationSchema = Joi.object({
  concern:           Joi.string().min(10).max(2000).required()
    .messages({ "any.required": "Please describe your concern" }),
  specialty:         Joi.string().valid("general", "maternal", "adolescent", "mental_health").default("general"),
  symptomSessionId:  Joi.string().hex().length(24),
});

export const messageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required()
    .messages({ "any.required": "Message content is required" }),
});

export const closureSchema = Joi.object({
  closureNotes:   Joi.string().min(10).required()
    .messages({ "any.required": "Closure notes are required" }),
  createReferral: Joi.boolean().default(false),
  facilityId:     Joi.when("createReferral", {
    is: true,
    then: Joi.string().hex().length(24).required()
      .messages({ "any.required": "Facility is required when creating a referral" }),
  }),
  referralReason: Joi.when("createReferral", {
    is: true,
    then: Joi.string().min(5).required(),
  }),
  urgency: Joi.string().valid("routine", "urgent", "emergency").default("routine"),
});

// ─── Facility ─────────────────────────────────────────────────────
export const facilitySchema = Joi.object({
  name:    Joi.string().min(2).max(200).required(),
  type:    Joi.string().valid("clinic", "hospital", "pharmacy", "lab", "chw").required(),
  coordinates: Joi.array().items(Joi.number()).length(2).required()
    .messages({ "array.length": "Coordinates must be [longitude, latitude]" }),
  address:        Joi.string().required(),
  phone:          Joi.string().pattern(/^\+?[\d\s\-().]{7,20}$/),
  email:          Joi.string().email({ tlds: { allow: false } }),
  services:       Joi.array().items(Joi.string().max(100)),
  operatingHours: Joi.alternatives().try(Joi.string(), Joi.object()),
});

// ─── Referral ─────────────────────────────────────────────────────
export const referralSchema = Joi.object({
  userId:          Joi.string().hex().length(24).required(),
  facilityId:      Joi.string().hex().length(24).required(),
  reason:          Joi.string().min(5).required(),
  urgency:         Joi.string().valid("routine", "urgent", "emergency").default("routine"),
  consultationId:  Joi.string().hex().length(24),
  appointmentDate: Joi.date().iso(),
  notes:           Joi.string().max(1000),
});

export const referralStatusSchema = Joi.object({
  status: Joi.string().valid("accepted", "completed", "cancelled").required()
    .messages({ "any.required": "Status is required" }),
  note: Joi.string().max(500),
});

// ─── Vital signs (for future use) ─────────────────────────────────
export const vitalSignsSchema = Joi.object({
  bloodPressure: Joi.object({
    systolic:  healthFields.systolic.required(),
    diastolic: healthFields.diastolic.required(),
  }),
  heartRate:        healthFields.heartRate,
  temperature:      healthFields.temperature,
  oxygenSaturation: healthFields.oxygenSat,
  bloodSugar:       healthFields.bloodSugar,
  recordedAt:       Joi.date().iso().max("now"),
  notes:            Joi.string().max(500).optional(),
});
