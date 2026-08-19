/*
  Purpose:
  Validate and normalize incoming Scene payloads for mutative requests.
*/

import { createValidator } from "../../helpers/validation";
import { SceneDTOSchema } from "./sceneSchemas";

const add = createValidator(
  { body: SceneDTOSchema },
  { inject: (req) => ({ play_id: req.play.id }) },
);

const edit = createValidator(
  { body: SceneDTOSchema },
  { inject: (req) => ({ id: req.scene.id, play_id: req.scene.play_id }) },
);

export default {
  add,
  edit,
};
