/*
  Purpose:
  Validate incoming payloads for Preferences.
*/

import { createValidator } from "../../helpers/validation";
import { PreferenceDTOSchema } from "./preferenceSchemas";

const setPlayPreference = createValidator(
  { body: PreferenceDTOSchema },
  { inject: (req) => ({ play_id: req.play.id, user_id: req.me.id }) },
);
const setScenePreference = createValidator(
  { body: PreferenceDTOSchema },
  { inject: (req) => ({ scene_id: req.scene.id, user_id: req.me.id }) },
);
const setRolePreference = createValidator(
  { body: PreferenceDTOSchema },
  {
    inject: (req) => ({
      role_id: req.role.id,
      user_id: req.me.id,
      scene_id: req.scene.id,
    }),
  },
);

export default {
  setPlayPreference,
  setScenePreference,
  setRolePreference,
};
