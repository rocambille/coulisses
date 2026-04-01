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

const BASE_PATH = "/api/users";
const USER_PATH = "/api/users/:userId";

router.param("userId", userParamConverter.convert);

const checkAccess: RequestHandler = (req, res, next) => {
  if (Number(req.params.userId) === req.me.id) {
    next();
  } else {
    res.sendStatus(403);
  }
};

/*
  Public read-only endpoints.
*/
router.get(BASE_PATH, userActions.browse);
router.get(USER_PATH, userActions.read);

/*
  Everything below this line requires authentication.
*/
router.use(BASE_PATH, authActions.verifyAccessToken);

/*
  User-specific mutations.
  - Authentication already enforced
  - Ownership enforced via checkAccess
*/
router
  .route(USER_PATH)
  .all(checkAccess)
  .put(userValidator.validate, userActions.edit)
  .delete(userActions.destroy);

export default router;
