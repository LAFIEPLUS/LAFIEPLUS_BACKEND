import { Router } from "express";
import { authorize, protect } from "../middleware/auth.js";
import { getAvailablePartners, toggleAvailability, updatePartnerProfile } from "../controllers/partnerController.js";

const partnerRouter = Router();

partnerRouter.get("/partner/available", protect, getAvailablePartners);

partnerRouter.patch("/partner/availability", protect, authorize("partner"), toggleAvailability);

partnerRouter.patch("/partner/profile", protect, authorize("partner"), updatePartnerProfile);

export default partnerRouter; 