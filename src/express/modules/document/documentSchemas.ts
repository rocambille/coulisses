import { z } from "zod";

export const PlayDocumentSchema = z.object({
  id: z.number(),
  play_id: z.number(),
  file_url: z.string(),
  mime_type: z.string(),
  original_name: z.string(),
  order_index: z.number(),
  created_at: z.string().nullable().optional(),
});

export type PlayDocument = z.infer<typeof PlayDocumentSchema>;
