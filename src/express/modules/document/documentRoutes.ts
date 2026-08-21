/*
  Purpose:
  Routes related to "documents" resources.
*/

import type { RequestHandler } from "express";
import { Router } from "express";
import { createUploader } from "../../helpers/upload";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import troupeRepository from "../troupe/troupeRepository";
import documentActions from "./documentActions";
import documentParamConverter from "./documentParamConverter";

const router = Router();

const PLAY_DOCUMENTS_PATH = "/api/plays/:playId/documents";
const DOCUMENT_PATH = "/api/documents/:documentId";

const documentUploader = createUploader({
  subfolder: "plays",
  maxSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ],
});

router.param("playId", playParamConverter.convert);
router.param("documentId", documentParamConverter.convert);

const checkIsPlayTroupeMember: RequestHandler = (req, res, next) => {
  if (troupeRepository.findMemberRole(req.play.troupe_id, req.me.id) != null) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsPlayTroupeAdmin: RequestHandler = (req, res, next) => {
  if (
    troupeRepository.findMemberRole(req.play.troupe_id, req.me.id) === "ADMIN"
  ) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsDocumentPlayTroupeAdmin: RequestHandler = (req, res, next) => {
  const play = playRepository.find(req.document.play_id);

  if (
    play &&
    troupeRepository.findMemberRole(play.troupe_id, req.me.id) === "ADMIN"
  ) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use([PLAY_DOCUMENTS_PATH, DOCUMENT_PATH], authActions.verifyAccessToken);

router.get(
  PLAY_DOCUMENTS_PATH,
  checkIsPlayTroupeMember,
  documentActions.browse,
);

router.post(
  PLAY_DOCUMENTS_PATH,
  checkIsPlayTroupeAdmin,
  documentUploader.array("documents"),
  documentActions.upload,
);

router.delete(
  DOCUMENT_PATH,
  checkIsDocumentPlayTroupeAdmin,
  documentActions.destroy,
);

export default router;
