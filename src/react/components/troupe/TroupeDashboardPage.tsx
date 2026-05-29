import { use } from "react";
import { NavLink, useOutletContext } from "react-router";
import z from "zod";
import { cache } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";
import PreferenceSelector from "../play/PreferenceSelector";

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
  const mutate = useMutate();

  const plays: Play[] = use(cache(`/api/troupes/${troupe.id}/plays`));

  const handleAddPlay = async (formData: FormData) => {
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();

    const parsed = playSchema.safeParse({ title, description });

    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return;
    }

    await mutate(`/api/troupes/${troupe.id}/plays`, "post", parsed.data, [
      `/api/troupes/${troupe.id}/plays`,
    ]);
  };

  return (
    <>
      <hgroup>
        <h2>{troupe.name}</h2>
        <p>{troupe.description}</p>
      </hgroup>

      <nav>
        <ul>
          <li>
            <NavLink to="members">👥 Gérer les membres</NavLink>
          </li>
          <li>
            <NavLink to="calendar">📅 Voir l'Agenda</NavLink>
          </li>
        </ul>
      </nav>

      {plays.length === 0 ? (
        <p>Aucune pièce pour le moment.</p>
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
              {play.description && <p>{play.description}</p>}
            </article>
          ))}
        </div>
      )}

      {isAdmin && (
        <details>
          <summary>Ajouter une pièce</summary>
          <form
            aria-label="Formulaire d'ajout d'une pièce"
            action={handleAddPlay}
          >
            <label htmlFor="play-title-input">Titre de la pièce</label>
            <input id="play-title-input" name="title" required />
            <label htmlFor="play-description-input">
              Description (optionnel)
            </label>
            <input id="play-description-input" name="description" />
            <button type="submit">Ajouter</button>
          </form>
        </details>
      )}
    </>
  );
}
