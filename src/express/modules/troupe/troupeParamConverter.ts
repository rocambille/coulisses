/*
  Purpose:
  Convert the `:troupeId` route parameter into a fully loaded Troupe.
*/

declare global {
  namespace Express {
    interface Request {
      troupe: Troupe;
    }
  }
}

import { createParamConverter } from "../../helpers/paramConverter";
import troupeRepository from "./troupeRepository";

export default createParamConverter(troupeRepository, "troupe");
