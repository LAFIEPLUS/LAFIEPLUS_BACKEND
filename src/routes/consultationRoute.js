import { Router } from "express";
import { authorize, can, protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { closureSchema, consultationSchema, messageSchema } from "../../validators/healthValidator.js";
import { 
    acceptConsultation, 
    cancelConsultation, 
    closeConsultation, 
    createConsultation, 
    getConsultation, 
    getConsultations, 
    getMessages, 
    sendMessage 
} from "../controllers/consultationController.js";
import { PERMISSIONS } from "../config/roles.js";

const consultationRouter = Router();

consultationRouter.use(protect);

consultationRouter.post("/consultation", authorize("user"), validate(consultationSchema), createConsultation);

consultationRouter.get("/consultations", can(PERMISSIONS.VIEW_CONSULTATIONS), getConsultations);

consultationRouter.get("/consultation/:id", can(PERMISSIONS.VIEW_CONSULTATIONS), getConsultation);

consultationRouter.patch("/consultation/:id/accept", authorize("partner"), acceptConsultation);

consultationRouter.post("/consultation/:id/messages", validate(messageSchema), sendMessage);

consultationRouter.get("/consultation/:id/messages", getMessages);

consultationRouter.patch("/consultation/:id/close", authorize("partner"), validate(closureSchema), closeConsultation);

consultationRouter.patch("/consultation/:id/cancel", cancelConsultation);

export default consultationRouter;
