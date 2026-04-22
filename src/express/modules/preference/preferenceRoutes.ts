/*
  Purpose:
  Routes related to "preferences".
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import sceneParamConverter from "../scene/sceneParamConverter";
import preferenceActions from "./preferenceActions";
import preferenceValidator from "./preferenceValidator";

const PREFERENCES_BY_SCENE_PATH = "/api/scenes/:sceneId/preferences";
const PREFERENCES_BY_PLAY_PATH = "/api/plays/:playId/preferences";

router.param("sceneId", sceneParamConverter.convert);
router.param("playId", playParamConverter.convert);

const checkIsMemberBySceneId: RequestHandler = (req, res, next) => {
  const members = playRepository.getMembers(req.scene.play_id);
  const isMember = members.some((member) => member.id === req.me.id);

  if (isMember) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsMemberByPlayId: RequestHandler = (req, res, next) => {
  const members = playRepository.getMembers(req.play.id);
  const isMember = members.some((member) => member.id === req.me.id);

  if (isMember) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(PREFERENCES_BY_SCENE_PATH, authActions.verifyAccessToken);

router
  .route(PREFERENCES_BY_SCENE_PATH)
  .put(
    checkIsMemberBySceneId,
    preferenceValidator.validate,
    preferenceActions.upsert,
  );

router.get(
  PREFERENCES_BY_PLAY_PATH,
  authActions.verifyAccessToken,
  checkIsMemberByPlayId,
  preferenceActions.browseByPlay,
);

export default router;
