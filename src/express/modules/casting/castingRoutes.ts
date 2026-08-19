/*
  Purpose:
  Routes related to "castings" resources.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import roleParamConverter from "../role/roleParamConverter";
import sceneParamConverter from "../scene/sceneParamConverter";
import troupeRepository from "../troupe/troupeRepository";
import castingActions from "./castingActions";
import castingValidators from "./castingValidators";

const PLAY_CASTINGS_PATH = "/api/plays/:playId/castings";
const CASTINGS_PATH = "/api/castings";

router.param("playId", playParamConverter.convert);
router.param("sceneId", sceneParamConverter.convert);
router.param("roleId", roleParamConverter.convert);

const checkIsPlayTroupeMember: RequestHandler = (req, res, next) => {
  if (troupeRepository.findMemberRole(req.play.troupe_id, req.me.id) != null) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsSceneTroupeAdmin: RequestHandler = (req, res, next) => {
  const play = playRepository.findByScene(req.body.scene_id);
  if (
    play &&
    troupeRepository.findMemberRole(play.troupe_id, req.me.id) === "ADMIN"
  ) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use([PLAY_CASTINGS_PATH, CASTINGS_PATH], authActions.verifyAccessToken);

// Dashboard
router.get(
  PLAY_CASTINGS_PATH,
  checkIsPlayTroupeMember,
  castingActions.dashboard,
);

// Assign / Unassign
router
  .route(CASTINGS_PATH)
  .all(castingValidators.validate, checkIsSceneTroupeAdmin)
  .post(castingActions.assign)
  .delete(castingActions.unassign);

export default router;
