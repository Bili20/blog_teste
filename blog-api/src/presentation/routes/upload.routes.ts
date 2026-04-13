import { Router } from "express";
import { UploadController } from "@/presentation/controllers/UploadController";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";
import { ROLE_ADMIN, ROLE_AUTHOR } from "@/shared/constants/roles.constants";
import { uploadSingle } from "@/shared/config/multer.config";

export function uploadRoutes(controller: UploadController): Router {
  const router = Router();

  router.post(
    "/",
    authenticate,
    requireRole(ROLE_ADMIN, ROLE_AUTHOR),
    uploadSingle,
    controller.uploadImage,
  );

  return router;
}
