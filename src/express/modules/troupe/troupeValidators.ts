/*
  Purpose:
  Validate and normalize incoming Troupe payloads for mutative requests.
*/

import { createValidator } from "../../helpers/validation";
import {
  AddMemberDTOSchema,
  TroupeDTOSchema,
  UpdateMemberDTOSchema,
} from "./troupeSchemas";

const add = createValidator({
  body: TroupeDTOSchema,
});

const addMember = createValidator(
  {
    body: AddMemberDTOSchema,
  },
  {
    inject: (req) => ({ troupe_id: req.troupe.id }),
  },
);

const updateMember = createValidator(
  {
    body: UpdateMemberDTOSchema,
  },
  {
    inject: (req) => ({ troupe_id: req.troupe.id, user_id: req.user.id }),
  },
);

export default {
  add,
  addMember,
  updateMember,
};
