/*
  Purpose:
  Convert the `:userId` route parameter into a fully loaded User.

  This module:
  - Centralizes user lookup logic
  - Attaches the resolved user to the request object
  - Stops the request early if the user does not exist

  Why this exists:
  - Avoids duplicated lookup code in controllers
  - Guarantees `req.user` for downstream handlers
  - Keeps route handlers small and predictable

  Related docs:
  - https://expressjs.com/en/5x/api.html#router.param
*/

/* ************************************************************************ */
/* Request augmentation                                                     */
/* ************************************************************************ */

/*
  Extend Express.Request to include `user`.

  After this param middleware runs successfully:
  - `req.user` is always defined
  - Controllers and guards can rely on it without null checks
*/
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

/*
  Export converter
*/
import { createParamConverter } from "../../helpers/paramConverter";
import userRepository from "./userRepository";

export default createParamConverter(userRepository, "user");
