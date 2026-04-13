import multer from "multer";
import { AppError } from "@/shared/errors/AppError";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Only image files are allowed (jpeg, png, gif, webp)", 400));
    }
  },
});

export const uploadSingle = upload.single("image");
