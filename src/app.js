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
import symptomRouter from "./routes/symptomRoutes.js";
import partnerRouter from "./routes/partnerRoutes.js";
import referralRouter from "./routes/referralRoutes.js";
import consultationRouter from "./routes/consultationRoute.js";
import facilityRouter from "./routes/facilityRoutes.js";
import libraryRouter from "./routes/libraryRoutes.js";


const app = express();

app.set("trust proxy", 1);

// ---Security and Logging---
app.use(helmet());
// app.use(cors({
//     origin: CLIENT_URL,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
// }));
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.DEVELOPMENT_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


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
app.use("/api/auth", authRouter);
app.use("/api", userRouter);
app.use("/api", symptomRouter);
app.use("/api", partnerRouter);
app.use("/api", referralRouter);
app.use("/api", consultationRouter);
app.use("/api", facilityRouter);
app.use("/api", libraryRouter);

// --- 404 Handler ---
app.use((req, res) => res.status(404).json({success: false, message: `Route ${req.originalUrl} not found`})
);

// --- Global Error Handler ---
app.use(errorHandler);


export default app;