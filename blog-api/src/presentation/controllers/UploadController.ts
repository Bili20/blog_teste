import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import sharp from "sharp";
import { AppError } from "@/shared/errors/AppError";
import { IMediaService } from "@/domain/interfaces/services/IMediaService";

export class UploadController {
  constructor(private readonly mediaService: IMediaService) {}

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

    const fileStats = fs.statSync(outputPath);

    const media = await this.mediaService.createMedia({
      filename: uniqueName,
      url: `/uploads/${uniqueName}`,
      mimetype: "image/webp",
      width: width ?? null,
      height: height ?? null,
      size: fileStats.size,
    });

    res.status(201).json({
      id: media.id,
      url: media.url,
      width: media.width,
      height: media.height,
    });
  };

  deleteImage = async (req: Request, res: Response): Promise<void> => {
    await this.mediaService.deleteMedia(req.params.id);
    res.status(204).send();
  };
}
