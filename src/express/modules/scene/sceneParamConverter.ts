/*
  Purpose:
  Convert the `:sceneId` route parameter into a fully loaded Scene.
*/

declare global {
  namespace Express {
    interface Request {
      scene: Scene;
    }
  }
}

import type { RequestParamHandler } from "express";

import sceneRepository from "./sceneRepository";

const convert: RequestParamHandler = async (req, res, next, sceneId) => {
  const scene = await sceneRepository.find(+sceneId);

  if (scene == null) {
    res.sendStatus(req.method === "DELETE" ? 204 : 404);
    return;
  }

  req.scene = scene;

  next();
};

export default { convert };
