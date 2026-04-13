import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import sharp from "sharp";
import { AppError } from "@/shared/errors/AppError";

export class UploadController {
  uploadImage = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new AppError("No image file provided", 400);
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.webp`;
    const outputPath = path.join(uploadsDir, uniqueName);

    const { width, height } = await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    res.status(201).json({
      url: `/uploads/${uniqueName}`,
      width,
      height,
    });
  };
}
