/*
  Purpose:
  Routes related to "auth" actions for Magic Link.
*/

import { Router } from "express";

const router = Router();

import authActions from "./authActions";

/* ************************************************************************ */
/* Public routes                                                            */
/* ************************************************************************ */

router.post("/api/auth/magic-link", authActions.sendMagicLink);
router.post("/api/auth/verify", authActions.verifyMagicLink);

// We map generic logout endpoint
router.post("/api/auth/logout", authActions.destroyAccessToken);

/* ************************************************************************ */
/* Authenticated routes                                                     */
/* ************************************************************************ */

router.get("/api/me", authActions.verifyAccessToken, authActions.findMe);

export default router;
