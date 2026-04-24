/*
  Purpose:
  Scenes management page for the teacher.
  Route: /plays/:playId/scenes
*/

import { use, useState } from "react";
import { useParams } from "react-router";
import { cache } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";
import { useAuth } from "../auth/AuthContext";
import { useMembership } from "./hooks";
import PreferenceList from "./PreferenceList";
import PreferenceSelector from "./PreferenceSelector";

function ScenesPage() {
  const { me } = useAuth();
  const { playId } = useParams();
  const mutate = useMutate();
  const { isTeacher, isActor } = useMembership(playId);

  const [editing, setEditing] = useState<Scene["id"] | null>(null);

  if (!playId) return null;

  const scenes: Scene[] = use(cache(`/api/plays/${playId}/scenes`));
  const preferences: PreferenceWithUser[] = use(
    cache(`/api/plays/${playId}/preferences`),
  );

  const handleAdd = async (formData: FormData) => {
    const title = formData.get("title")?.toString();
    if (!title) throw new Error("Invalid form submission");

    await mutate(
      `/api/plays/${playId}/scenes`,
      "post",
      {
        title,
        scene_order: scenes.length + 1,
      },
      [`/api/plays/${playId}/scenes`],
    );
  };

  const handleEdit = async (sceneId: Scene["id"], formData: FormData) => {
    const title = formData.get("title")?.toString();
    const scene_order = Number(formData.get("scene_order"));

    if (!title || Number.isNaN(scene_order)) {
      throw new Error("Invalid form submission");
    }

    const response = await mutate(
      `/api/scenes/${sceneId}`,
      "put",
      {
        title,
        scene_order,
      },
      [`/api/plays/${playId}/scenes`],
    );

    if (response.ok) {
      setEditing(null);
    }
  };

  const handleDelete = async (sceneId: Scene["id"]) => {
    await mutate(`/api/scenes/${sceneId}`, "delete", undefined, [
      `/api/plays/${playId}/scenes`,
    ]);
  };

  return (
    <>
      <hgroup>
        <h2>Scènes</h2>
        <p>Organisation de la pièce et expression des préférences.</p>
      </hgroup>

      {scenes.length === 0 ? (
        <p>Aucune scène pour le moment.</p>
      ) : (
        scenes.map((scene) => (
          <article key={scene.id}>
            {editing === scene.id ? (
              <form
                action={(formData) => handleEdit(Number(scene.id), formData)}
              >
                <input
                  name="title"
                  defaultValue={scene.title}
                  aria-label="Titre"
                  required
                />
                <input
                  name="scene_order"
                  type="number"
                  defaultValue={scene.scene_order}
                  aria-label="Ordre"
                />
                <button
                  type="submit"
                  aria-label={`Enregistrer la scène ${scene.title}`}
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="secondary"
                  aria-label={`Annuler la modification de la scène ${scene.title}`}
                  onClick={() => setEditing(null)}
                >
                  Annuler
                </button>
              </form>
            ) : (
              <>
                <header
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <strong>
                    {scene.scene_order}. {scene.title}
                  </strong>
                  {isActor && (
                    <PreferenceSelector
                      sceneId={scene.id}
                      playId={playId}
                      currentLevel={
                        preferences.find(
                          (p) =>
                            p.scene_id === scene.id && p.user_id === me?.id,
                        )?.level
                      }
                    />
                  )}
                </header>
                {scene.description && <p>{scene.description}</p>}
                <PreferenceList sceneId={scene.id} preferences={preferences} />
                {isTeacher && (
                  <footer style={{ marginTop: "1rem" }}>
                    <button
                      type="button"
                      className="secondary"
                      aria-label={`Modifier la scène ${scene.title}`}
                      onClick={() => setEditing(scene.id)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="contrast"
                      aria-label={`Supprimer la scène ${scene.title}`}
                      onClick={() => handleDelete(scene.id)}
                    >
                      Supprimer
                    </button>
                  </footer>
                )}
              </>
            )}
          </article>
        ))
      )}

      {isTeacher && (
        <details>
          <summary>Ajouter une scène</summary>
          <form action={handleAdd}>
            <input
              name="title"
              placeholder="Titre de la scène"
              aria-label="Titre de la nouvelle scène"
              required
            />
            <button type="submit">Ajouter</button>
          </form>
        </details>
      )}
    </>
  );
}

export default ScenesPage;
