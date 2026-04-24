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

import { createParamConverter } from "../../helpers/paramConverter";
import sceneRepository from "./sceneRepository";

export default createParamConverter(sceneRepository, "scene");
