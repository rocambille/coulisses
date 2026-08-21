/*
  Purpose:
  Convert the `:documentId` route parameter into a fully loaded PlayDocument.
*/

import type { PlayDocument } from "./documentSchemas";

declare global {
  namespace Express {
    interface Request {
      document: PlayDocument;
    }
  }
}

import { createParamConverter } from "../../helpers/paramConverter";
import documentRepository from "./documentRepository";

export default createParamConverter(documentRepository, "document");
