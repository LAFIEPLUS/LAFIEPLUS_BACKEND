import { Router } from "express";
import validate from "../middleware/validate.js";
import { facilitySchema } from "../../validators/healthValidator.js";
import {
  createFacility,
  getFacility,
  getNearby,
  suggestFacilities,
  updateFacility,
} from "../controllers/facilityController.js";
import { authorize, can, optionalAuth, protect } from "../middleware/auth.js";
import { PERMISSIONS } from "../config/roles.js";

const facilityRouter = Router();

// ─── Protected — any logged in user ───────────────────────────────
facilityRouter.get("/facility/nearby",
  protect, can(PERMISSIONS.READ_FACILITIES), getNearby);

facilityRouter.get("/facility/suggest",
  protect, can(PERMISSIONS.READ_FACILITIES), suggestFacilities);

// ─── Public ────────────────────────────────────────────────────────
facilityRouter.get("/facility/:id",
  optionalAuth, getFacility);

// ─── Admin only — protect + authorize on each route individually ───
facilityRouter.post("/facility",
  protect, authorize("admin"), validate(facilitySchema), createFacility);

facilityRouter.put("/facility/:id",
  protect, authorize("admin"), updateFacility);

export default facilityRouter;