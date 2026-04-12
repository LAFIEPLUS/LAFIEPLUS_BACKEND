import { Router } from "express";
import { PERMISSIONS } from "../config/roles.js";
import validate from "../middleware/validate.js"
import { symptomCheckSchema } from "../../validators/healthValidator.js";
import { checkSymptoms, getHistory, getRiskLevels, getSession } from "../controllers/symptomController.js";
import { can, protect } from "../middleware/auth.js";

const symptomRouter = Router();

symptomRouter.get("/risk-levels", getRiskLevels);

symptomRouter.use(protect);

symptomRouter.post("/symptoms/check", can(PERMISSIONS.USE_SYMPTOM_CHECKER), validate(symptomCheckSchema), checkSymptoms);

symptomRouter.get("/symptoms/history", can(PERMISSIONS.USE_SYMPTOM_CHECKER), getHistory);

symptomRouter.get("/symptoms/history/:id", can(PERMISSIONS.USE_SYMPTOM_CHECKER), getSession);

export default symptomRouter;