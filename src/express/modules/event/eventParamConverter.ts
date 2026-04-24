/*
  Purpose:
  Convert req.params.eventId into an Event entity directly attached to req.event.
*/

declare global {
  namespace Express {
    interface Request {
      event: EventData;
    }
  }
}

import { createParamConverter } from "../../helpers/paramConverter";
import eventRepository from "./eventRepository";

export default createParamConverter(eventRepository, "event");
