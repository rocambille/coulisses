/*
  Purpose:
  Routes related to "scenes".
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository"; // To check play membership
import sceneActions from "./sceneActions";
import sceneParamConverter from "./sceneParamConverter";
import sceneValidator from "./sceneValidator";

const SCENES_BY_PLAY_PATH = "/api/plays/:playId/scenes";
const SCENE_PATH = "/api/scenes/:sceneId";

router.param("playId", playParamConverter.convert);
router.param("sceneId", sceneParamConverter.convert);

// Reusable middlewares to check permissions
const checkIsMemberByPlayId: RequestHandler = async (req, res, next) => {
  const userId = Number(req.auth.sub);
  const members = await playRepository.getMembers(req.play.id);
  const isMember = members.some((m) => m.id === userId);

  if (isMember) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacherByPlayId: RequestHandler = async (req, res, next) => {
  const userId = Number(req.auth.sub);
  const members = await playRepository.getMembers(req.play.id);
  const member = members.find((m) => m.id === userId);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacherBySceneId: RequestHandler = async (req, res, next) => {
  const userId = Number(req.auth.sub);
  const playId = req.scene.play_id;
  const members = await playRepository.getMembers(playId);
  const member = members.find((m) => m.id === userId);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

// All scene endpoints require authentication
router.use([SCENES_BY_PLAY_PATH, "/api/scenes"], authActions.verifyAccessToken);

// List/Add scenes for a specific play
router
  .route(SCENES_BY_PLAY_PATH)
  .get(checkIsMemberByPlayId, sceneActions.browse)
  .post(checkIsTeacherByPlayId, sceneValidator.validate, sceneActions.add);

// Edit/Delete an existing scene (requires to be TEACHER of the play the scene belongs to)
router
  .route(SCENE_PATH)
  .all(checkIsTeacherBySceneId)
  .get(sceneActions.read) // Or allow members to read single scenes? For now restricted if we want. Actually let's allow member read if needed, but the UI might only browse.
  .put(sceneValidator.validate, sceneActions.edit)
  .delete(sceneActions.destroy);

export default router;
