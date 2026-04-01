import { Router } from "express";
import { authLimiter } from "../middleware/rateLimiter";

const authRouter = Router();

authRouter.post("/register", authLimiter, validate())