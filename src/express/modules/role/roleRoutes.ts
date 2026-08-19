/*
  Purpose:
  Routes related to "roles" resources.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import troupeRepository from "../troupe/troupeRepository";
import roleActions from "./roleActions";
import roleParamConverter from "./roleParamConverter";
import roleValidators from "./roleValidators";

const PLAY_ROLES_PATH = "/api/plays/:playId/roles";
const ROLE_PATH = "/api/roles/:roleId";
const ROLE_SCENES_PATH = "/api/roles/:roleId/scenes";

router.param("playId", playParamConverter.convert);
router.param("roleId", roleParamConverter.convert);

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

// Helper for role routes (need to fetch play to check troupe)
const checkIsRoleTroupeAdmin: RequestHandler = (req, res, next) => {
  const play = playRepository.find(req.role.play_id);
  if (
    play &&
    troupeRepository.findMemberRole(play.troupe_id, req.me.id) === "ADMIN"
  ) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(
  [PLAY_ROLES_PATH, ROLE_PATH, ROLE_SCENES_PATH],
  authActions.verifyAccessToken,
);

router.get(PLAY_ROLES_PATH, checkIsPlayTroupeMember, roleActions.browse);
router.post(
  PLAY_ROLES_PATH,
  checkIsPlayTroupeAdmin,
  roleValidators.add,
  roleActions.add,
);

router.post(
  ROLE_SCENES_PATH,
  checkIsRoleTroupeAdmin,
  roleValidators.linkScene,
  roleActions.linkScene,
);

router.delete(ROLE_PATH, checkIsRoleTroupeAdmin, roleActions.destroy);

export default router;
