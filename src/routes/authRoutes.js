import { Router } from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import { 
    forgotPasswordSchema, 
    loginSchema, 
    registerSchema, 
    resetPasswordSchema 
} from "../../validators/authValidator.js";
import { protect } from "../middleware/auth.js";
import { 
    forgotPassword, 
    getMe, 
    login, 
    logout, 
    register, 
    resetPassword 
} from "../controllers/authController.js";
import validate from "../middleware/validate.js";

const authRouter = Router();

authRouter.post("/register", authLimiter, validate(registerSchema), register);

authRouter.post("/login", authLimiter, validate(loginSchema), login);

authRouter.post("/logout", protect, logout);

authRouter.get("/me", protect, getMe);

authRouter.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);

authRouter.put("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

export default authRouter;