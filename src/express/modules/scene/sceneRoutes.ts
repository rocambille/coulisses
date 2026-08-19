/*
  Purpose:
  Routes related to "scenes" resources.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import troupeRepository from "../troupe/troupeRepository";
import sceneActions from "./sceneActions";
import sceneParamConverter from "./sceneParamConverter";
import sceneValidators from "./sceneValidators";

const PLAY_SCENES_PATH = "/api/plays/:playId/scenes";
const SCENE_PATH = "/api/scenes/:sceneId";

router.param("playId", playParamConverter.convert);
router.param("sceneId", sceneParamConverter.convert);

// Helper for play routes
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

const checkIsSceneTroupeAdmin: RequestHandler = (req, res, next) => {
  const play = playRepository.find(req.scene.play_id);
  if (
    play &&
    troupeRepository.findMemberRole(play.troupe_id, req.me.id) === "ADMIN"
  ) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use([PLAY_SCENES_PATH, SCENE_PATH], authActions.verifyAccessToken);

// Nested routes under play
router.get(PLAY_SCENES_PATH, checkIsPlayTroupeMember, sceneActions.browse);
router.post(
  PLAY_SCENES_PATH,
  checkIsPlayTroupeAdmin,
  sceneValidators.add,
  sceneActions.add,
);

// Flat routes for specific scene
router.put(
  SCENE_PATH,
  checkIsSceneTroupeAdmin,
  sceneValidators.edit,
  sceneActions.edit,
);
router.delete(SCENE_PATH, checkIsSceneTroupeAdmin, sceneActions.destroy);

export default router;
