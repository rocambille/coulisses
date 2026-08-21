/*
  Purpose:
  Centralize all mocked data for play documents.
*/

import { mainPlay } from "./plays";

export const allDocuments: PlayDocument[] = [
  {
    id: 1,
    play_id: mainPlay.id,
    file_url: "/uploads/plays/hamlet_couverture.jpg",
    mime_type: "image/jpeg",
    original_name: "Hamlet_Couverture.jpg",
    order_index: 1,
    created_at: "2026-06-01T10:00:00Z",
  },
  {
    id: 2,
    play_id: mainPlay.id,
    file_url: "/uploads/plays/hamlet_acte1.pdf",
    mime_type: "application/pdf",
    original_name: "Hamlet_Acte1.pdf",
    order_index: 2,
    created_at: "2026-06-01T10:05:00Z",
  },
];

export const mainDocument = allDocuments[0];
export const pdfDocument = allDocuments[1];
