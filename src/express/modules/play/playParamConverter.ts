/*
  Purpose:
  Convert the `:playId` route parameter into a fully loaded Play.
*/

declare global {
  namespace Express {
    interface Request {
      play: Play;
    }
  }
}

import type { RequestParamHandler } from "express";

import playRepository from "./playRepository";

const convert: RequestParamHandler = async (req, res, next, playId) => {
  const play = await playRepository.read(+playId);

  if (play == null) {
    res.sendStatus(req.method === "DELETE" ? 204 : 404);
    return;
  }

  req.play = play;

  next();
};

export default { convert };
