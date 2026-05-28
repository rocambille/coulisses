/*
  Purpose:
  Routes related to "troupes" resources.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import troupeActions from "./troupeActions";
import troupeParamConverter from "./troupeParamConverter";
import troupeRepository from "./troupeRepository";
import troupeValidator, {
  addMemberValidator,
  updateMemberValidator,
} from "./troupeValidator";

const BASE_PATH = "/api/troupes";
const TROUPE_PATH = "/api/troupes/:troupeId";
const MEMBERS_PATH = "/api/troupes/:troupeId/members";
const TROUPE_MEMBER_PATH = "/api/troupes/:troupeId/members/:userId";

router.param("troupeId", troupeParamConverter.convert);

// Authorization check: User must be a member of the troupe to view it
const checkIsMember: RequestHandler = async (req, res, next) => {
  if (troupeRepository.findMember(req.troupe.id, req.me.id)) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsAdmin: RequestHandler = async (req, res, next) => {
  if (troupeRepository.findMember(req.troupe.id, req.me.id)?.role === "ADMIN") {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(
  [BASE_PATH, TROUPE_PATH, MEMBERS_PATH, TROUPE_MEMBER_PATH],
  authActions.verifyAccessToken,
);

router.post(BASE_PATH, troupeValidator.validate, troupeActions.add);
router.get(BASE_PATH, troupeActions.browse);

router.route(TROUPE_PATH).all(checkIsMember).get(troupeActions.read);

// Members
router
  .route(MEMBERS_PATH)
  .get(checkIsMember, troupeActions.browseMembers)
  .post(checkIsAdmin, addMemberValidator.validate, troupeActions.addMember);

router
  .route(TROUPE_MEMBER_PATH)
  .all(checkIsAdmin)
  .put(updateMemberValidator.validate, troupeActions.updateMember)
  .delete(troupeActions.removeMember);

export default router;
