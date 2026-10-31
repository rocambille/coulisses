/*
  Purpose:
  Provide reusable multipart file upload middleware factory for Express modules.

  Related docs:
  - https://github.com/expressjs/multer
*/

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { RequestHandler } from "express";
import multer from "multer";

export interface UploaderOptions {
  subfolder: string;
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
}

const MIME_TO_EXTENSION = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["application/pdf", ".pdf"],
]);

const DEFAULT_OPTIONS: Required<Omit<UploaderOptions, "subfolder">> = {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB
  allowedMimeTypes: Array.from(MIME_TO_EXTENSION.keys()),
};

export const UPLOADS_DIR = path.join(
  import.meta.dirname,
  "../../../data/uploads",
);

export const createUploader = (
  options: UploaderOptions,
): multer.Multer & { destDir: string } => {
  const { subfolder, allowedMimeTypes, maxSizeBytes } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const destDir = path.join(UPLOADS_DIR, subfolder);

  fs.mkdirSync(destDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destDir),
    filename: (_req, file, cb) => {
      const ext =
        MIME_TO_EXTENSION.get(file.mimetype) ??
        path.extname(file.originalname).toLowerCase();

      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  const uploader = multer({
    storage,
    limits: { fileSize: maxSizeBytes },
    // Browsers send file names as UTF-8, multer defaults to latin1
    defParamCharset: "utf8",
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const error: Error & { status?: number } = new Error(
          `Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(", ")}`,
        );

        // Attach status code for Express error handler
        error.status = 400;

        cb(error);
      }
    },
  });

  return Object.assign(uploader, { destDir });
};

export const deleteUploadedFile = (relativeUrl?: string | null): void => {
  if (!relativeUrl?.startsWith("/uploads/")) return;

  const filePath = path.join(import.meta.dirname, "../../../data", relativeUrl);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/*
  discardFileOnFailure:
  - multer stores req.file before the following handlers run
  - Removes that file when the request ends up failing, so a rejected
    payload does not leave an orphan on disk
  - Must be registered before the uploader
*/
export const discardFileOnFailure: RequestHandler = (req, res, next) => {
  res.on("finish", () => {
    if (req.file != null && res.statusCode >= 400) {
      fs.rmSync(req.file.path, { force: true });
    }
  });

  next();
};
