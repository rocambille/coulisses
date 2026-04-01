/*
  Purpose:
  Routes related to "castings".
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import castingActions from "./castingActions";
import castingValidator from "./castingValidator";

const CASTINGS_BY_PLAY_PATH = "/api/plays/:playId/castings";

router.param("playId", playParamConverter.convert);

// Reusable middlewares to check permissions
const checkIsMemberByPlayId: RequestHandler = async (req, res, next) => {
  const userId = req.me.id;
  const playId = req.play.id;
  const members = await playRepository.getMembers(playId);
  const isMember = members.some((member) => member.id === userId);

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

router.use(CASTINGS_BY_PLAY_PATH, authActions.verifyAccessToken);

// Teacher can assign a role to a user
router
  .route(CASTINGS_BY_PLAY_PATH)
  .post(
    checkIsTeacherByPlayId,
    castingValidator.validate,
    castingActions.assignRole,
  )
  .delete(
    checkIsTeacherByPlayId,
    castingValidator.validate,
    castingActions.unassignRole,
  )
  .get(checkIsMemberByPlayId, castingActions.getMatrix);

export default router;
