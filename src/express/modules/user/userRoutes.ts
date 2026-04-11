/*
  Purpose:
  Routes related to "users" resources.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import userActions from "./userActions";
import userParamConverter from "./userParamConverter";
import userValidator from "./userValidator";

const USER_PATH = "/api/users/:userId";

router.param("userId", userParamConverter.convert);

const checkAccess: RequestHandler = (req, res, next) => {
  if (Number(req.params.userId) === req.me.id) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(USER_PATH, authActions.verifyAccessToken);
router
  .route(USER_PATH)
  .all(checkAccess)
  .get(userActions.read)
  .put(userValidator.validate, userActions.edit)
  .delete(userActions.destroy);

export default router;
