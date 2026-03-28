import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "./env.js";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

/**
 * Factory - creates a multer upload middleware for a cloudinary folder.
 * @param {string} folder - Cloudinary folder e.g. "avatars"
 * @param {string[]} allowedFormats e.g. ["jpg", "png"]
 * @param {number} maxSizeMB - Max file size in MB
 */

export const createUploader = (
    folder = "uploads",
    allowedFormats = ["jpg", "jpeg", "png", "webp", "pdf"],
    maxSizeMB = 5
) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder,
            allowed_formats: allowedFormats,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
    });

    return multer({
        storage,
        limits: {fileSize: maxSizeMB * 1024 * 1024},
        fileFilter: (_req, file, cb) => {
            const ext = file.mimetype.split("/")[1];
            if (!allowedFormats.includes(ext)) {
                return cb(new Error(`Invalid file type. Allowed: ${allowedFormats.join(", ")}`), false);
            }
            cb(null, true);
        },
    });
};


// Pre-built uploaders
export const avatarUpload = createUploader("avatars", ["jpg", "jpeg", "png", "webp"], 2);
export const documentUpload = createUploader("documents", ["jpg", "jpeg", "png", "pdf"], 10);

/**
 * Delet a file from the cloudinary by its public_id
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Coudinary delete error:", error)
        throw error;        
    }
};

export default cloudinary;