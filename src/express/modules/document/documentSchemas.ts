import { z } from "zod";

export const DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

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
