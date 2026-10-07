import { use, useState } from "react";
import { NavLink, useOutletContext } from "react-router";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";

import { getOrFetch } from "../../helpers/cache";
import { mutate } from "../../helpers/mutate";
import { FormError, hasError } from "../FormError";
import Modal from "../ui/Modal";
import PreferenceSelector from "../ui/PreferenceSelector";

const playSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string(),
});

export default function TroupeDashboardPage() {
  const { troupe, isAdmin, playPreferences } = useOutletContext<{
    troupe: Troupe;
    isAdmin: boolean;
    playPreferences: PlayPreference[];
  }>();
  const [isAddingPlay, setIsAddingPlay] = useState(false);
  const [errors, setErrors] = useState<ZodIssue[]>([]);

  const plays: Play[] = use(getOrFetch(`/api/troupes/${troupe.id}/plays`));

  const handleAddPlay = async (formData: FormData) => {
    const parsed = playSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      setErrors(parsed.error.issues);
      return;
    }

    setErrors([]);
    await mutate(`/api/troupes/${troupe.id}/plays`, "post", parsed.data, [
      `/api/troupes/${troupe.id}/plays`,
    ]);
    setIsAddingPlay(false);
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
                    playPreferences.find((p) => p.play_id === play.id)?.level
                  }
                />
              </header>
              <p>{play.description || "..."}</p>
            </article>
          ))}
        </div>
      )}

      {isAddingPlay && (
        <Modal
          title="Ajouter une pièce"
          onClose={() => {
            setErrors([]);
            setIsAddingPlay(false);
          }}
        >
          <form
            aria-label="Formulaire d'ajout d'une pièce"
            action={handleAddPlay}
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
                onClick={() => {
                  setErrors([]);
                  setIsAddingPlay(false);
                }}
              >
                Annuler
              </button>
              <button type="submit" style={{ width: "initial" }}>
                Ajouter
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </>
  );
}
