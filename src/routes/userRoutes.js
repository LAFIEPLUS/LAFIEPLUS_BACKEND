import { Router } from "express";
import { authorize, can, protect } from "../middleware/auth.js";
import { PERMISSIONS } from "../config/roles.js";
import { 
    deleteAvatar, 
    deleteUser, 
    getAllUsers, 
    getMyProfile, 
    getUserById, 
    notifyUser, 
    updateProfile, 
    updateUserRole, 
    updateUserStatus, 
    uploadAvatar 
} from "../controllers/userController.js";
import { avatarUpload } from "../config/cloudinary.js";
import handleUploadError from "../middleware/uploadError.js";
import validate from "../middleware/validate.js";
import { 
    notifyUserSchema, 
    updateUserRoleSchema 
} from "../../validators/userValidator.js";

const userRouter = Router();

// All routes below this middleware will require authentication
userRouter.use(protect);

// --- All Roles
userRouter.get("/profile", can(PERMISSIONS.READ_OWN_PROFILE), getMyProfile);

userRouter.patch("/profile", can(PERMISSIONS.UPDATE_OWN_PROFILE), updateProfile);

userRouter.post("/avatar", avatarUpload.single("avatar"), handleUploadError, uploadAvatar);

userRouter.delete("/avatar", deleteAvatar);

//--- Admin Only
userRouter.get("/", authorize("admin"), getAllUsers);

userRouter.get("/:id", authorize("admin", "partner"), getUserById);

userRouter.put("/:id/role", authorize("admin"), validate(updateUserRoleSchema), updateUserRole);

userRouter.put("/:id/status", authorize("admin"), updateUserStatus);

userRouter.post("/:id/notify", authorize("admin", "partner"), validate(notifyUserSchema), notifyUser);

userRouter.delete("/:id", authorize("admin"), deleteUser);

export default userRouter;