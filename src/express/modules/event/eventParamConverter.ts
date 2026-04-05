/*
  Purpose:
  Convert req.params.eventId into an Event entity directly attached to req.event.
*/

import type { RequestParamHandler } from "express";
import eventRepository from "./eventRepository";

declare global {
  namespace Express {
    interface Request {
      event: EventData;
    }
  }
}

const convert: RequestParamHandler = async (req, res, next, eventId) => {
  const event = await eventRepository.find(+eventId);

  if (event == null) {
    res.sendStatus(req.method === "DELETE" ? 204 : 404);
    return;
  }

  req.event = event;

  next();
};

export default { convert };
