/*
  Purpose:
  Convert the `:roleId` route parameter into a fully loaded Role.
*/

declare global {
  namespace Express {
    interface Request {
      role: Role;
    }
  }
}

import { createParamConverter } from "../../helpers/paramConverter";
import roleRepository from "./roleRepository";

export default createParamConverter(roleRepository, "role");
