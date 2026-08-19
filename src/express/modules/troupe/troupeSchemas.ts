import { z } from "zod";
import { UserSchema } from "../user/userSchemas";

export const TroupeSchema = z.object({
  id: z.number(),
  name: z.string().max(255),
  description: z.string(),
  external_discussion_link: z.url().or(z.literal("")),
  created_at: z.iso.datetime(),
});

export type Troupe = z.infer<typeof TroupeSchema>;

export const TroupeDTOSchema = TroupeSchema.omit({
  id: true,
  created_at: true,
});

export type TroupeDTO = z.infer<typeof TroupeDTOSchema>;

export const TroupeMemberSchema = UserSchema.extend({
  troupe_id: z.number(),
  role: z.enum(["ADMIN", "ACTOR"]),
  joined_at: z.iso.datetime(),
});

export type TroupeMember = z.infer<typeof TroupeMemberSchema>;

export const AddMemberDTOSchema = TroupeMemberSchema.pick({
  email: true,
  role: true,
});

export type AddMemberDTO = z.infer<typeof AddMemberDTOSchema>;

export const UpdateMemberDTOSchema = TroupeMemberSchema.pick({
  role: true,
});

export type UpdateMemberDTO = z.infer<typeof UpdateMemberDTOSchema>;
