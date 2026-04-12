import { Router } from "express";
import { authorize, protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { referralSchema, referralStatusSchema } from "../../validators/healthValidator.js";
import { createReferral, getReferral, getReferrals, updateReferralStatus } from "../controllers/referralController.js";

const referralRouter = Router();

referralRouter.use(protect); 

referralRouter.post("/referral", validate(referralSchema), createReferral);

referralRouter.get("/referrals", getReferrals);

referralRouter.get("/referral/:id", getReferral);

referralRouter.patch("/referral/:id/status", authorize("partner", "admin"), validate(referralStatusSchema), updateReferralStatus);

export default referralRouter;