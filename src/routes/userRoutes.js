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
  uploadAvatar,
} from "../controllers/userController.js";
import { avatarUpload } from "../config/cloudinary.js";
import handleUploadError from "../middleware/uploadError.js";
import validate from "../middleware/validate.js";
import {
  notifyUserSchema,
  updateUserRoleSchema,
} from "../../validators/userValidator.js";

const userRouter = Router();

// ─── Own profile — any authenticated user ─────────────────────────
userRouter.get("/user/profile",
  protect, can(PERMISSIONS.READ_OWN_PROFILE), getMyProfile);

userRouter.patch("/user/profile",
  protect, can(PERMISSIONS.UPDATE_OWN_PROFILE), updateProfile);

userRouter.post("/user/avatar",
  protect, avatarUpload.single("avatar"), handleUploadError, uploadAvatar);

userRouter.delete("/user/avatar",
  protect, deleteAvatar);

// ─── Admin only ────────────────────────────────────────────────────
userRouter.get("/user/profiles",
  protect, authorize("admin"), getAllUsers);

userRouter.get("/user/:id",
  protect, authorize("admin", "partner"), getUserById);

userRouter.put("/user/:id/role",
  protect, authorize("admin"), validate(updateUserRoleSchema), updateUserRole);

userRouter.put("/user/:id/status",
  protect, authorize("admin"), updateUserStatus);

userRouter.post("/user/:id/notify",
  protect, authorize("admin", "partner"), validate(notifyUserSchema), notifyUser);

userRouter.delete("/user/:id",
  protect, authorize("admin"), deleteUser);

export default userRouter;