/*
  Purpose:
  Routes related to "plays" resources.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import troupeParamConverter from "../troupe/troupeParamConverter";
import troupeRepository from "../troupe/troupeRepository";
import playActions from "./playActions";
import playParamConverter from "./playParamConverter";
import playValidator from "./playValidator";

const TROUPE_PLAYS_PATH = "/api/troupes/:troupeId/plays";
const PLAY_PATH = "/api/plays/:playId";

router.param("troupeId", troupeParamConverter.convert);
router.param("playId", playParamConverter.convert);

// Authorization check for Troupe routes (browse/create plays)
const checkIsTroupeMember: RequestHandler = (req, res, next) => {
  if (troupeRepository.findMember(req.troupe.id, req.me.id) !== null) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTroupeAdmin: RequestHandler = (req, res, next) => {
  if (troupeRepository.findMember(req.troupe.id, req.me.id)?.role === "ADMIN") {
    next();
  } else {
    res.sendStatus(403);
  }
};

// Authorization check for Play routes (read specific play)
const checkIsPlayTroupeMember: RequestHandler = (req, res, next) => {
  if (troupeRepository.findMember(req.play.troupe_id, req.me.id) != null) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use([TROUPE_PLAYS_PATH, PLAY_PATH], authActions.verifyAccessToken);

router.get(TROUPE_PLAYS_PATH, checkIsTroupeMember, playActions.browse);
router.post(
  TROUPE_PLAYS_PATH,
  checkIsTroupeAdmin,
  playValidator.validate,
  playActions.add,
);

router.get(PLAY_PATH, checkIsPlayTroupeMember, playActions.read);

const checkIsPlayTroupeAdmin: RequestHandler = (req, res, next) => {
  if (
    troupeRepository.findMember(req.play.troupe_id, req.me.id)?.role === "ADMIN"
  ) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.put(
  PLAY_PATH,
  checkIsPlayTroupeAdmin,
  playValidator.validate,
  playActions.edit,
);
router.delete(PLAY_PATH, checkIsPlayTroupeAdmin, playActions.destroy);

export default router;
