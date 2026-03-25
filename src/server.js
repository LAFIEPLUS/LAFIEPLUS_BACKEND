import app from "../api";
import { PORT, validateEnvVars } from "./config/env.js";


try {
    validateEnvVars();
} catch (error) {
    console.error("Missing env vars:", error.message);
    process.exit(1);
}

const server = app.listen(PORT, () => {
    console.log(
        `\n🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log(`  Local: http://localhost:${PORT}\n`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION:", err.message);
    server.close(() => process.exit(1));
});