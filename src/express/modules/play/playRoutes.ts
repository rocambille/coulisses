/*
  Purpose:
  Routes related to "plays" resources.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playActions from "./playActions";
import playParamConverter from "./playParamConverter";
import playRepository from "./playRepository";
import playValidator from "./playValidator";

const BASE_PATH = "/api/plays";
const PLAY_PATH = "/api/plays/:playId";
const MEMBERS_PATH = "/api/plays/:playId/members";

router.param("playId", playParamConverter.convert);

// Authorization check: User must be a member of the play to view or modify it
const checkIsMember: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.play.id);
  const isMember = members.some((member) => member.id === req.me.id);

  if (isMember) {
    // For MVP, we can attach the user's role if needed or just pass
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacher: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.play.id);
  const member = members.find((member) => member.id === req.me.id);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use([BASE_PATH, PLAY_PATH, MEMBERS_PATH], authActions.verifyAccessToken);

router.post(BASE_PATH, playValidator.validate, playActions.add);
router.get(BASE_PATH, playActions.browse);

router.route(PLAY_PATH).all(checkIsMember).get(playActions.read);

router
  .route(PLAY_PATH)
  .all(checkIsTeacher)
  .put(playValidator.validate, playActions.edit)
  .delete(playActions.destroy);

// Members
router
  .route(MEMBERS_PATH)
  .get(checkIsMember, playActions.browseMembers)
  .post(checkIsTeacher, playValidator.validateMember, playActions.addMember);

export default router;
