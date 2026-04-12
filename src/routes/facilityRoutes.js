import { Router } from "express";
import validate from "../middleware/validate.js";
import { facilitySchema } from "../../validators/healthValidator.js";
import { createFacility, getFacility, getNearby, suggestFacilities, updateFacility } from "../controllers/facilityController.js";
import { authorize, can, optionalAuth, protect } from "../middleware/auth.js";
import { PERMISSIONS } from "../config/roles.js";

const facilityRouter = Router();

facilityRouter.get("/facility/nearby", protect, can(PERMISSIONS.READ_FACILITIES), getNearby);

facilityRouter.get("/facility/suggest", protect, can(PERMISSIONS.READ_FACILITIES), suggestFacilities);

facilityRouter.get("/facility/:id", optionalAuth, getFacility);

facilityRouter.use(protect, authorize("admin"));
facilityRouter.post("/facility", validate(facilitySchema), createFacility);

facilityRouter.put("/facility/:id", updateFacility);

export default facilityRouter;