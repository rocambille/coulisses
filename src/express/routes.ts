/*
  Purpose:
  Central HTTP routing entry point for the Express API.

  Responsibilities:
  - Register global middlewares (cookies, CSRF protection, JSON parsing)
  - Expose a minimal health / sanity endpoint
  - Compose feature modules (auth, users, plays, etc.)

  Design notes:
  - This file contains no business logic
  - Each feature lives in its own isolated module
  - Middleware order is explicit and intentional

  Related docs:
  - https://expressjs.com/en/guide/routing.html
  - https://expressjs.com/en/guide/using-middleware.html
*/

/* ************************************************************************ */
/* Router initialization                                                    */
/* ************************************************************************ */

import { Router } from "express";

/*
  A single root router is used for the entire API.
  Feature modules will attach their own sub-routes to it.
*/
const router = Router();

/* ************************************************************************ */
/* Global middlewares                                                       */
/* ************************************************************************ */

import cookieParser from "cookie-parser";
import { json } from "express";

import { csrf } from "./middlewares";

/*
  Middleware order matters:

  1. cookieParser()
     - Parses cookies into req.cookies
     - Required for authentication and CSRF validation

  2. csrf()
     - Validates double-submit CSRF tokens on mutative requests
     - Stateless, cookie + header comparison only

  3. json()
     - Parses application/json request bodies
     - Must run after CSRF checks to avoid unnecessary parsing
*/
router.use(cookieParser(), csrf(), json());

/* ************************************************************************ */
/* Base endpoint                                                            */
/* ************************************************************************ */

/*
  Minimal API sanity check.
  Useful for smoke tests and quick validation that the server is reachable.
*/
router.get("/api/health", (_req, res) => {
  res.json({ hello: "world" });
});

router.post("/api/health", (req, res) => {
  res.json({ hello: req.body.hello });
});

/* ************************************************************************ */
/* Module composition                                                       */
/* ************************************************************************ */

/*
  Feature modules are imported dynamically to:
  - Keep the root router lightweight
  - Allow easy cloning / replacement of modules
  - Avoid a monolithic routes file

  Each module exports a Router instance as default.
*/
const importAndUse = async (path: string) =>
  router.use((await import(path)).default);

/*
  Registered API modules.
  The order does not matter as long as routes do not conflict.
*/
await importAndUse("./modules/auth/authRoutes");
await importAndUse("./modules/casting/castingRoutes");
await importAndUse("./modules/event/eventRoutes");
await importAndUse("./modules/play/playRoutes");
await importAndUse("./modules/preference/preferenceRoutes");
await importAndUse("./modules/role/roleRoutes");
await importAndUse("./modules/scene/sceneRoutes");
await importAndUse("./modules/user/userRoutes");

/* ************************************************************************ */
/* Export                                                                   */
/* ************************************************************************ */

export default router;
