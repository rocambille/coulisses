/*
  Purpose:
  Routes related to "events" (calendar).
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import eventActions from "./eventActions";
import eventParamConverter from "./eventParamConverter";
import eventValidator from "./eventValidator";

const EVENTS_BY_PLAY_PATH = "/api/plays/:playId/events";
const EVENT_BY_ID_PATH = "/api/events/:eventId";

router.param("playId", playParamConverter.convert);
router.param("eventId", eventParamConverter.convert);

const checkIsMemberByPlayId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.play.id);
  const isMember = members.some((m) => m.id === req.me.id);

  if (isMember) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacherByPlayId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.play.id);
  const member = members.find((m) => m.id === req.me.id);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacherByEventId: RequestHandler = async (req, res, next) => {
  // Use event's play_id to check role
  const members = await playRepository.getMembers(req.event.play_id);
  const member = members.find((m) => m.id === req.me.id);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

// All event routes are protected
router.use(EVENTS_BY_PLAY_PATH, authActions.verifyAccessToken);
router.use(EVENT_BY_ID_PATH, authActions.verifyAccessToken);

// GET /api/plays/:playId/events - List events (members only)
// POST /api/plays/:playId/events - Create event (teachers only)
router
  .route(EVENTS_BY_PLAY_PATH)
  .get(checkIsMemberByPlayId, eventActions.browse)
  .post(checkIsTeacherByPlayId, eventValidator.validate, eventActions.add);

// PUT /api/events/:eventId - Update event (teachers only)
// DELETE /api/events/:eventId - Delete event (teachers only)
router
  .route(EVENT_BY_ID_PATH)
  .put(checkIsTeacherByEventId, eventValidator.validate, eventActions.edit)
  .delete(checkIsTeacherByEventId, eventActions.destroy);

export default router;
