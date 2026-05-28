/*
  Purpose:
  Routes related to "events" resources.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import { z } from "zod";
import { createValidator } from "../../helpers/validation";
import authActions from "../auth/authActions";
import troupeParamConverter from "../troupe/troupeParamConverter";
import troupeRepository from "../troupe/troupeRepository";
import eventActions from "./eventActions";
import eventParamConverter from "./eventParamConverter";
import eventValidator from "./eventValidator";

const presenceValidator = createValidator(
  z.object({ status: z.enum(["PRESENT", "ABSENT"]) }),
);

const TROUPE_EVENTS_PATH = "/api/troupes/:troupeId/events";
const EVENT_PATH = "/api/events/:eventId";
const EVENT_PRESENCE_PATH = "/api/events/:eventId/presence";

router.param("troupeId", troupeParamConverter.convert);
router.param("eventId", eventParamConverter.convert);

const checkIsTroupeMember: RequestHandler = (req, res, next) => {
  if (troupeRepository.findMember(req.troupe.id, req.me.id) != null) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsEventTroupeMember: RequestHandler = (req, res, next) => {
  if (troupeRepository.findMember(req.event.troupe_id, req.me.id) != null) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsEventOwnerOrAdmin: RequestHandler = (req, res, next) => {
  const member = troupeRepository.findMember(req.event.troupe_id, req.me.id);
  if (member?.role === "ADMIN" || req.event.owner_id === req.me.id) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(
  [TROUPE_EVENTS_PATH, EVENT_PATH, EVENT_PRESENCE_PATH],
  authActions.verifyAccessToken,
);

// Nested under troupe
router.get(TROUPE_EVENTS_PATH, checkIsTroupeMember, eventActions.browse);
router.post(
  TROUPE_EVENTS_PATH,
  checkIsTroupeMember,
  eventValidator.validate,
  eventActions.add,
);

// Flat routes
router.get(EVENT_PATH, checkIsEventTroupeMember, eventActions.read);
router.put(
  EVENT_PATH,
  checkIsEventOwnerOrAdmin,
  eventValidator.validate,
  eventActions.edit,
);
router.delete(EVENT_PATH, checkIsEventOwnerOrAdmin, eventActions.destroy);

// Presence
router.post(
  EVENT_PRESENCE_PATH,
  checkIsEventTroupeMember,
  presenceValidator.validate,
  eventActions.setPresence,
);

export default router;
