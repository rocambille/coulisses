/*
  Purpose:
  Routes related to "users" resources.

  This file defines:
  - Public read endpoints
  - Authenticated write endpoints
  - Ownership-based authorization rules

  Guiding principles:
  - Read access is public
  - Write access is authenticated
  - Mutations are restricted to resource owners

  Related docs:
  - https://restfulapi.net/resource-naming/
  - https://expressjs.com/en/guide/routing.html
  - https://expressjs.com/en/5x/api.html#router.param
*/

/* ************************************************************************ */
/* Router setup                                                             */
/* ************************************************************************ */

import { Router } from "express";

const router = Router();

/* ************************************************************************ */
/* Dependencies                                                             */
/* ************************************************************************ */

/*
  authActions:
  - verifyAccessToken injects `req.me`
  - `req.me` contains the authenticated user
*/
import authActions from "../auth/authActions";

/*
  userActions:
  - Thin controllers
  - One action per route
*/
import userActions from "./userActions";

/*
  userParamConverter:
  - Centralizes user lookup
  - Attaches `req.user`
  - Fails fast if user does not exist
*/
import userParamConverter from "./userParamConverter";

/*
  userValidator:
  - Validates request payloads
  - Prevents invalid data from reaching actions
*/
import userValidator from "./userValidator";

/* ************************************************************************ */
/* Route constants                                                          */
/* ************************************************************************ */

/*
  Paths are declared once to:
  - Avoid duplication
  - Make refactors trivial
*/
const BASE_PATH = "/api/users";
const USER_PATH = "/api/users/:userId";

/* ************************************************************************ */
/* Param converter                                                          */
/* ************************************************************************ */

/*
  Automatically resolves :userId parameters.

  After this middleware:
  - req.user is guaranteed to exist
  - Downstream handlers can assume a valid user
*/
router.param("userId", userParamConverter.convert);

/* ************************************************************************ */
/* Authorization rules                                                      */
/* ************************************************************************ */

import type { RequestHandler } from "express";

/*
  Ownership check.

  Authorization logic is kept:
  - Explicit
  - Local to the resource
  - Easy to audit

  Assumptions:
  - req.params.userId is the owner
  - req.me.id is the authenticated user id
*/
const checkAccess: RequestHandler = (req, res, next) => {
  if (req.user.id === req.me.id) {
    next();
  } else {
    res.sendStatus(403);
  }
};

/* ************************************************************************ */
/* Authentication wall                                                      */
/* ************************************************************************ */

/*
  Everything below this line requires authentication.

  This pattern:
  - Makes the security boundary visually obvious
  - Avoids repeating auth middleware on every route
*/
router.use(BASE_PATH, authActions.verifyAccessToken);

/* ************************************************************************ */
/* Authenticated routes                                                     */
/* ************************************************************************ */

/*
  User-specific mutations.
  - Authentication already enforced
  - Ownership enforced via checkAccess
*/
router
  .route(USER_PATH)
  .all(checkAccess)
  .get(userActions.read)
  .put(userValidator.validate, userActions.edit)
  .delete(userActions.destroy);

/* ************************************************************************ */
/* Export                                                                   */
/* ************************************************************************ */

export default router;
