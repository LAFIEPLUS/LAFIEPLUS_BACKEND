//Vercel Serverless Entry Point
import "dotenv/config";
import { validateEnvVars } from "../src/config/env.js";
import app from "../src/app.js";

try {
    validateEnvVars();
} catch (error) {
    console.error("Missing env vars:", error.message);
}

export default app;