/*
  Purpose:
  Centralize all mocked data for play documents.
*/

import type { DatabaseSync } from "node:sqlite";

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

export const seedDocuments = (db: DatabaseSync) => {
  const insertDocument = db.prepare(
    "insert into play_document(id, play_id, file_url, mime_type, original_name, order_index, created_at) values(?, ?, ?, ?, ?, ?, ?)",
  );
  for (const document of allDocuments) {
    insertDocument.run(
      document.id,
      document.play_id,
      document.file_url,
      document.mime_type,
      document.original_name,
      document.order_index,
      document.created_at ?? null,
    );
  }
};
