import multer from "multer"
import { sendError } from "../utils/apiResponse.js"

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") 
            return sendError(res, 400, "File is too large");
        return sendError(res, 400, `upload error: ${err.message}`);
    }

    if (err?.message?.includes("Invalid file type"))
        return sendError(res, 400, err.message);
    next(err);
};

export default handleUploadError;