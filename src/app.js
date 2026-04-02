import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import connectDB  from "./config/db.js";
import { CLIENT_URL, NODE_ENV } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";


const app = express();

// ---Security and Logging---
app.use(helmet());
app.use(cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

if (NODE_ENV === "development") app.use(morgan("dev"));

// ---Body Parsing---
app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true}));


// ---DB Middleware (cached for serverless) ---
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});

//---Rates Limiting Middleware---
app.use("/api", apiLimiter);

// --- Health Check ---
app.get("/", (req, res) => res.json({success: true, message: "API is running 🚀", env: NODE_ENV})
);
app.get("/health", (req, res) => res.json({success: true, message: "Healthy", timestamp: new Date().toISOString()})
);

// --- Routes ---
app.use(authRouter);
app.use(userRouter);

// --- 404 Handler ---
app.use((req, res) => res.status(404).json({success: false, message: `Route ${req.originalUrl} not found`})
);

// --- Global Error Handler ---
app.use(errorHandler);


export default app;