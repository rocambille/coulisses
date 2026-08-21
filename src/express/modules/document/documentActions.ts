/*
  Purpose:
  Define HTTP request handlers for Play Document operations.
*/

import type { RequestHandler } from "express";
import { deleteUploadedFile } from "../../helpers/upload";
import documentRepository from "./documentRepository";
import type { PlayDocument } from "./documentSchemas";

const browse: RequestHandler = (req, res) => {
  const documents = documentRepository.findByPlay(req.play.id);

  res.json(documents);
};

const upload: RequestHandler = (req, res) => {
  const files: Express.Multer.File[] = [];

  if (req.file) {
    files.push(req.file);
  } else if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === "object") {
    for (const field of Object.values(req.files)) {
      files.push(...field);
    }
  }

  if (files.length === 0) {
    res.status(400).json({ message: "No files attached" });
    return;
  }

  let currentCount = documentRepository.countByPlay(req.play.id);
  const created: PlayDocument[] = [];

  for (const file of files) {
    currentCount += 1;
    const fileUrl = `/uploads/plays/${file.filename}`;
    const docId = documentRepository.create({
      play_id: req.play.id,
      file_url: fileUrl,
      mime_type: file.mimetype,
      original_name: file.originalname,
      order_index: currentCount,
    });

    const doc = documentRepository.find(docId);
    if (doc) {
      created.push(doc);
    }
  }

  res.status(201).json(created);
};

const destroy: RequestHandler = (req, res) => {
  documentRepository.hardDelete(req.document.id);
  deleteUploadedFile(req.document.file_url);

  res.sendStatus(204);
};

export default {
  browse,
  upload,
  destroy,
};
