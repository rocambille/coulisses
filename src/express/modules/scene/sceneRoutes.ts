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

const checkIsMemberBySceneId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.scene.play_id);
  const isMember = members.some((member) => member.id === req.me.id);

  if (isMember) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacherBySceneId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.scene.play_id);
  const member = members.find((member) => member.id === req.me.id);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use([SCENES_BY_PLAY_PATH, SCENE_PATH], authActions.verifyAccessToken);

router
  .route(SCENES_BY_PLAY_PATH)
  .get(checkIsMemberByPlayId, sceneActions.browse)
  .post(checkIsTeacherByPlayId, sceneValidator.validate, sceneActions.add);

router.route(SCENE_PATH).all(checkIsMemberBySceneId).get(sceneActions.read);

router
  .route(SCENE_PATH)
  .all(checkIsTeacherBySceneId)
  .put(sceneValidator.validate, sceneActions.edit)
  .delete(sceneActions.destroy);

export default router;
