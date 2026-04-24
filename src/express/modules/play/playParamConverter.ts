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

import { createParamConverter } from "../../helpers/paramConverter";
import playRepository from "./playRepository";

export default createParamConverter(playRepository, "play");
