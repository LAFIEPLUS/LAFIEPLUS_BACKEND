import "dotenv/config";


const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET_KEY"];

export const validateEnvVars = () => {
    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(", ")}`
        );
    }
};

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = parseInt(process.env.PORT, 10) || 3000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
