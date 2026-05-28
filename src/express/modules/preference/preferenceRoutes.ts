/*
  Purpose:
  Routes related to "preferences" resources.
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
import preferenceActions from "./preferenceActions";
import preferenceValidator from "./preferenceValidator";

const ME_PREFERENCES_PATH = "/api/preferences/me";
const PLAY_PREFERENCES_PATH = "/api/plays/:playId/preferences";
const SCENE_PREFERENCES_PATH = "/api/scenes/:sceneId/preferences";
const ROLE_PREFERENCES_PATH = "/api/scenes/:sceneId/roles/:roleId/preferences";

router.param("playId", playParamConverter.convert);
router.param("sceneId", sceneParamConverter.convert);
router.param("roleId", roleParamConverter.convert);

const checkIsPlayTroupeMember: RequestHandler = (req, res, next) => {
  if (troupeRepository.findMember(req.play.troupe_id, req.me.id) != null) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsSceneTroupeMember: RequestHandler = (req, res, next) => {
  const play = playRepository.find(req.scene.play_id);
  if (play && troupeRepository.findMember(play.troupe_id, req.me.id) != null) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(
  [
    ME_PREFERENCES_PATH,
    PLAY_PREFERENCES_PATH,
    SCENE_PREFERENCES_PATH,
    ROLE_PREFERENCES_PATH,
  ],
  authActions.verifyAccessToken,
);

router.get(ME_PREFERENCES_PATH, preferenceActions.getMePreferences);

router.post(
  PLAY_PREFERENCES_PATH,
  checkIsPlayTroupeMember,
  preferenceValidator.validate,
  preferenceActions.setPlayPreference,
);

router.post(
  SCENE_PREFERENCES_PATH,
  checkIsSceneTroupeMember,
  preferenceValidator.validate,
  preferenceActions.setScenePreference,
);

router.post(
  ROLE_PREFERENCES_PATH,
  checkIsSceneTroupeMember, // same check as scene level
  preferenceValidator.validate,
  preferenceActions.setRolePreference,
);

export default router;
