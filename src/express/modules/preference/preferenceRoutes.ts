/*
  Purpose:
  Routes related to "preferences".
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playRepository from "../play/playRepository";
import sceneParamConverter from "../scene/sceneParamConverter";
import preferenceActions from "./preferenceActions";
import preferenceValidator from "./preferenceValidator";

const PREFERENCES_BY_SCENE_PATH = "/api/scenes/:sceneId/preferences";

router.param("sceneId", sceneParamConverter.convert);

// Ensure the user is part of the play that contains the scene
const checkIsMemberBySceneId: RequestHandler = async (req, res, next) => {
  const userId = Number(req.auth.sub);

  const members = await playRepository.getMembers(req.scene.play_id);
  const isMember = members.some((m) => m.id === userId);

  if (isMember) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(PREFERENCES_BY_SCENE_PATH, authActions.verifyAccessToken);

// A Comédien connected can save or update their preference.
router
  .route(PREFERENCES_BY_SCENE_PATH)
  .post(
    checkIsMemberBySceneId,
    preferenceValidator.validate,
    preferenceActions.upsert,
  );

export default router;
