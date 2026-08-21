/*
  Purpose:
  Render and manage play preview photos and PDF documents.
  Allows admins to snap photos or upload files and members to view pages.
  Route: /troupes/:troupeId/plays/:playId/documents
*/

import { use, useId, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { getOrFetch } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";

export default function DocumentsPage() {
  const { playId } = useParams();
  const { isAdmin } = useOutletContext<{
    isAdmin: boolean;
  }>();

  const documents = use(
    getOrFetch<PlayDocument[]>(`/api/plays/${playId}/documents`),
  );
  const mutate = useMutate();

  const cameraInputId = useId();
  const fileInputId = useId();

  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const images = documents.filter((doc) => doc.mime_type.startsWith("image/"));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("documents", files[i]);
    }

    try {
      await mutate(`/api/plays/${playId}/documents`, "post", formData, [
        `/api/plays/${playId}/documents`,
      ]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erreur lors du téléversement",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (doc: PlayDocument) => {
    if (!window.confirm(`Supprimer le document "${doc.original_name}" ?`)) {
      return;
    }

    await mutate(`/api/documents/${doc.id}`, "delete", null, [
      `/api/plays/${playId}/documents`,
    ]);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h3>Documents & Photos</h3>
          <p style={{ margin: 0, color: "var(--pico-muted-color)" }}>
            Aperçus du texte, photos de pages et documents de la pièce.
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              id={cameraInputId}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <button
              type="button"
              style={{ cursor: uploading ? "wait" : "pointer" }}
              onClick={() => document.getElementById(cameraInputId)?.click()}
            >
              📸 Prendre une photo
            </button>

            <input
              id={fileInputId}
              type="file"
              accept="image/*,application/pdf"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <button
              type="button"
              className="secondary outline"
              style={{ cursor: uploading ? "wait" : "pointer" }}
              onClick={() => document.getElementById(fileInputId)?.click()}
            >
              📁 Importer photos / PDF
            </button>
          </div>
        )}
      </div>

      {uploading && (
        <article aria-busy="true">
          Téléversement des fichiers en cours...
        </article>
      )}

      {uploadError && (
        <article
          style={{
            backgroundColor:
              "var(--pico-form-element-invalid-active-border-color)",
          }}
        >
          {uploadError}
        </article>
      )}

      {documents.length === 0 && !uploading && (
        <article style={{ textAlign: "center", padding: "2rem" }}>
          <p>Aucun document ni photo pour cette pièce pour le moment.</p>
          {isAdmin && (
            <p style={{ color: "var(--pico-muted-color)", fontSize: "0.9rem" }}>
              Utilisez les boutons ci-dessus pour prendre une photo avec votre
              appareil ou importer des fichiers.
            </p>
          )}
        </article>
      )}

      {documents.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h4>Documents & Photos ({documents.length})</h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {documents.map((doc) => {
              const isImage = doc.mime_type.startsWith("image/");
              const imageIndex = isImage
                ? images.findIndex((img) => img.id === doc.id)
                : -1;

              return (
                <article
                  key={doc.id}
                  style={{
                    padding: "0.75rem",
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {isImage ? (
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "center",
                        width: "100%",
                        color: "inherit",
                      }}
                      onClick={() => setActivePhotoIndex(imageIndex)}
                    >
                      <img
                        src={doc.file_url}
                        alt={doc.original_name}
                        style={{
                          height: "160px",
                          objectFit: "cover",
                          width: "100%",
                          borderRadius: "var(--pico-border-radius)",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Photo {imageIndex + 1}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--pico-muted-color)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doc.original_name}
                      </div>
                    </button>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "160px",
                          backgroundColor:
                            "var(--pico-card-sectionning-background-color)",
                          borderRadius: "var(--pico-border-radius)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "3rem" }}>📄</span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            marginTop: "0.25rem",
                          }}
                        >
                          Document PDF
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doc.original_name}
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="button outline"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          marginTop: "0.5rem",
                          display: "block",
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        Ouvrir ↗
                      </a>
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      className="outline contrast"
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        marginTop: "0.5rem",
                      }}
                      aria-label={`Supprimer le document ${doc.id}`}
                      onClick={() => handleDelete(doc)}
                    >
                      Supprimer
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Lightbox / Modal for photos */}
      {activePhotoIndex !== null && images[activePhotoIndex] && (
        <dialog open aria-label="Aperçu de la photo">
          <article style={{ maxWidth: "800px", width: "90vw", margin: "auto" }}>
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>
                Page {activePhotoIndex + 1} sur {images.length} —{" "}
                {images[activePhotoIndex].original_name}
              </strong>
              <button
                type="button"
                aria-label="Fermer"
                className="close"
                onClick={() => setActivePhotoIndex(null)}
              />
            </header>

            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <img
                src={images[activePhotoIndex].file_url}
                alt={images[activePhotoIndex].original_name}
                style={{
                  maxHeight: "65vh",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </div>

            <footer
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                className="outline"
                disabled={activePhotoIndex === 0}
                onClick={() => setActivePhotoIndex(activePhotoIndex - 1)}
                aria-label="Page précédente"
              >
                ← Précédente
              </button>

              <button
                type="button"
                className="outline"
                disabled={activePhotoIndex === images.length - 1}
                onClick={() => setActivePhotoIndex(activePhotoIndex + 1)}
                aria-label="Page suivante"
              >
                Suivante →
              </button>
            </footer>
          </article>
        </dialog>
      )}
    </div>
  );
}
