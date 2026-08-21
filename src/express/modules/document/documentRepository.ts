/*
  Purpose:
  Centralize all persistence logic related to PlayDocument entities.
*/

import database from "../../../database";
import { type PlayDocument, PlayDocumentSchema } from "./documentSchemas";

class DocumentRepository {
  create(doc: {
    play_id: number;
    file_url: string;
    mime_type: string;
    original_name: string;
    order_index: number;
  }): PlayDocument["id"] {
    const result = database
      .prepare(
        `insert into play_document (play_id, file_url, mime_type, original_name, order_index)
         values (?, ?, ?, ?, ?)`,
      )
      .run(
        doc.play_id,
        doc.file_url,
        doc.mime_type,
        doc.original_name,
        doc.order_index,
      );

    return Number(result.lastInsertRowid);
  }

  find(id: number): PlayDocument | null {
    const row = database
      .prepare("select * from play_document where id = ?")
      .get(id);

    return row ? PlayDocumentSchema.parse(row) : null;
  }

  findByPlay(playId: number): PlayDocument[] {
    const rows = database
      .prepare(
        "select * from play_document where play_id = ? order by order_index asc, id asc",
      )
      .all(playId);

    return rows.map((row) => PlayDocumentSchema.parse(row));
  }

  countByPlay(playId: number): number {
    const row = database
      .prepare("select count(*) as count from play_document where play_id = ?")
      .get(playId) as { count: number } | undefined;

    return Number(row?.count);
  }

  hardDelete(id: number): boolean {
    const result = database
      .prepare("delete from play_document where id = ?")
      .run(id);

    return result.changes > 0;
  }
}

export default new DocumentRepository();
