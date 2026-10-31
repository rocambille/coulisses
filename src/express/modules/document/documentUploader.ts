/*
  Purpose:
  Shared upload middleware for play documents.
*/

import { createUploader } from "../../helpers/upload";
import {
  DOCUMENT_MAX_SIZE_BYTES,
  DOCUMENT_MIME_TYPES,
} from "./documentSchemas";

export default createUploader({
  subfolder: "plays",
  maxSizeBytes: DOCUMENT_MAX_SIZE_BYTES,
  allowedMimeTypes: DOCUMENT_MIME_TYPES,
});
