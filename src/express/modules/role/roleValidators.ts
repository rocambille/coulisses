/*
  Purpose:
  Validate and normalize incoming Role payloads for mutative requests.
*/

import z from "zod";
import { createValidator } from "../../helpers/validation";
import { SceneSchema } from "../scene/sceneSchemas";
import { RoleDTOSchema } from "./roleSchemas";

const add = createValidator(
  { body: RoleDTOSchema },
  { inject: (req) => ({ play_id: req.play.id }) },
);

const linkScene = createValidator(
  { body: z.object({ sceneId: SceneSchema.shape.id }) },
  { inject: (req) => ({ roleId: req.role.id }) },
);

export default { add, linkScene };
