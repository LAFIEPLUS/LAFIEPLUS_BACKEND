//Vercel Serverless Entry Point
import "dotenv/config";
import { validateEnvVars } from "../src/config/env";

try {
    validateEnvVars();
} catch (error) {
    console.error("Missing env vars:", error.message);
}

export default app;