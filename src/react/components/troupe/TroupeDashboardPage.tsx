import { type FormEvent, use, useRef, useState } from "react";
import { NavLink, useOutletContext } from "react-router";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";

import {
  DOCUMENT_MAX_SIZE_BYTES,
  DOCUMENT_MIME_TYPES,
} from "../../../express/modules/document/documentSchemas";
import { getOrFetch } from "../../helpers/cache";
import { mutate } from "../../helpers/mutate";
import { useMe } from "../auth/MeContext";
import { FormError, hasError } from "../FormError";
import Modal from "../ui/Modal";
import PreferenceSelector from "../ui/PreferenceSelector";

const playSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string(),
  document: z
    .file()
    .max(DOCUMENT_MAX_SIZE_BYTES, "Le fichier ne doit pas dépasser 10 Mo")
    .mime(DOCUMENT_MIME_TYPES, "Format accepté : PDF, JPEG, PNG, WEBP ou GIF")
    .optional(),
});

export default function TroupeDashboardPage() {
  const { user } = useMe();
  const { troupe, isAdmin, playPreferences } = useOutletContext<{
    troupe: Troupe;
    isAdmin: boolean;
    playPreferences: PlayPreference[];
  }>();
  const [isAddingPlay, setIsAddingPlay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ZodIssue[]>([]);
  const documentInput = useRef<HTMLInputElement>(null);

  const plays: Play[] = use(getOrFetch(`/api/troupes/${troupe.id}/plays`));

  const closeAddPlay = () => {
    setErrors([]);
    setSubmitError(null);
    setIsAddingPlay(false);
  };

  // onSubmit rather than a form action: React resets the fields after an
  // action, and a failed attempt must keep the title and the selected file.
  const handleAddPlay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const parsed = playSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      document: documentInput.current?.files?.[0],
    });

    if (!parsed.success) {
      setErrors(parsed.error.issues);
      return;
    }

    const { title, description, document: file } = parsed.data;

    let body: FormData | { title: string; description: string } = {
      title,
      description,
    };

    if (file != null) {
      body = new FormData();
      body.append("title", title);
      body.append("description", description);
      body.append("document", file);
    }

    setErrors([]);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await mutate(`/api/troupes/${troupe.id}/plays`, "post", body, [
        `/api/troupes/${troupe.id}/plays`,
      ]);
      closeAddPlay();
    } catch {
      setSubmitError("L'ajout de la pièce a échoué. Vous pouvez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlay = async (play: Play) => {
    if (
      !confirm(
        `Supprimer la pièce "${play.title}" ? Toutes les scènes, rôles et documents associés seront supprimés.`,
      )
    ) {
      return;
    }
    await mutate(`/api/plays/${play.id}`, "delete", null, [
      `/api/troupes/${troupe.id}/plays`,
    ]);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <hgroup style={{ margin: 0 }}>
          <h2>{troupe.name}</h2>
          <p>{troupe.description}</p>
        </hgroup>

        {isAdmin && (
          <button
            type="button"
            aria-label="Ajouter une pièce"
            onClick={() => {
              setErrors([]);
              setIsAddingPlay(true);
            }}
            style={{ width: "auto" }}
          >
            ➕ Ajouter une pièce
          </button>
        )}
      </div>

      <nav>
        <ul>
          <li>
            <NavLink to="members">
              {isAdmin ? "👥 Gérer les membres" : "👥 Voir les membres"}
            </NavLink>
          </li>
          <li>
            <NavLink to="calendar">📅 Voir l'Agenda</NavLink>
          </li>
        </ul>
      </nav>

      {plays.length === 0 ? (
        <p className="empty-state">
          <strong>La scène est vide pour l'instant.</strong>
          <br />
          Ajoutez une première pièce pour commencer à organiser les répétitions.
        </p>
      ) : (
        <div className="grid">
          {plays.map((play) => (
            <article key={play.id}>
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <NavLink to={`/troupes/${troupe.id}/plays/${play.id}/scenes`}>
                  <strong>{play.title}</strong>
                </NavLink>
                <PreferenceSelector
                  playId={String(play.id)}
                  currentLevel={
                    playPreferences.find(
                      (p) => p.play_id === play.id && p.user_id === user?.id,
                    )?.level
                  }
                />
              </header>
              <p>{play.description || "..."}</p>
              {isAdmin && (
                <footer style={{ marginTop: "1rem" }}>
                  <button
                    aria-label={`Supprimer la pièce ${play.id}`}
                    type="button"
                    className="contrast outline"
                    style={{ fontSize: "smaller", margin: 0 }}
                    onClick={() => handleDeletePlay(play)}
                  >
                    Supprimer
                  </button>
                </footer>
              )}
            </article>
          ))}
        </div>
      )}

      {isAddingPlay && (
        <Modal title="Ajouter une pièce" onClose={closeAddPlay}>
          <form
            aria-label="Formulaire d'ajout d'une pièce"
            onSubmit={handleAddPlay}
          >
            <label htmlFor="play-title-input">
              Titre de la pièce
              <input
                id="play-title-input"
                name="title"
                required
                aria-invalid={hasError(errors, "title") || undefined}
                aria-describedby="play-title-input-error"
              />
              <FormError
                issues={errors}
                name="title"
                id="play-title-input-error"
              />
            </label>
            <label htmlFor="play-description-input">
              Description (optionnel)
              <input
                id="play-description-input"
                name="description"
                aria-invalid={hasError(errors, "description") || undefined}
                aria-describedby="play-description-input-error"
              />
              <FormError
                issues={errors}
                name="description"
                id="play-description-input-error"
              />
            </label>
            <label htmlFor="play-document-input">
              Texte ou document initial (optionnel, PDF ou photo)
              <input
                id="play-document-input"
                ref={documentInput}
                type="file"
                accept={DOCUMENT_MIME_TYPES.join(",")}
                aria-invalid={hasError(errors, "document") || undefined}
                aria-describedby="play-document-input-error play-document-input-desc"
              />
              <FormError
                issues={errors}
                name="document"
                id="play-document-input-error"
              />
              <small id="play-document-input-desc">
                Vous pourrez ajouter d'autres documents plus tard dans l'onglet
                Documents.
              </small>
            </label>
            {submitError != null && <p role="alert">{submitError}</p>}
            <footer
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "end",
              }}
            >
              <button
                type="button"
                className="secondary outline"
                onClick={closeAddPlay}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{ width: "initial" }}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                Ajouter
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </>
  );
}
