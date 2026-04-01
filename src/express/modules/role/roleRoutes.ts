/*
  Purpose:
  Routes related to "roles".
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import roleActions from "./roleActions";
import roleValidator from "./roleValidator";

const ROLES_BY_PLAY_PATH = "/api/plays/:playId/roles";

router.param("playId", playParamConverter.convert);

// Reusable middlewares to check permissions
const checkIsMemberByPlayId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.play.id);
  const isMember = members.some((member) => member.id === req.me.id);

  if (isMember) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacherByPlayId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.play.id);
  const member = members.find((member) => member.id === req.me.id);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(ROLES_BY_PLAY_PATH, authActions.verifyAccessToken);

router
  .route(ROLES_BY_PLAY_PATH)
  .get(checkIsMemberByPlayId, roleActions.browse)
  .post(checkIsTeacherByPlayId, roleValidator.validate, roleActions.add);

export default router;
