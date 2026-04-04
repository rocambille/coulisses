/*
  Purpose:
  Scenes management page for the teacher.
  Route: /plays/:playId/scenes
*/

import { use, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { cache, invalidateCache, mutate } from "../utils";
import PreferenceList from "./PreferenceList";
import PreferenceSelector from "./PreferenceSelector";

function ScenesPage() {
  const { me } = useAuth();

  const [editing, setEditing] = useState<number | null>(null);

  const { playId } = useParams();
  if (!playId) return null;

  const scenes: Scene[] = use(cache(`/api/plays/${playId}/scenes`));
  const members: (User & { role: string })[] = use(
    cache(`/api/plays/${playId}/members`),
  );
  const preferences: PreferenceWithUser[] = use(
    cache(`/api/plays/${playId}/preferences`),
  );

  const member = members.find((member) => member.id === me?.id);
  const isTeacher = member?.role === "TEACHER";
  const isActor = member?.role === "ACTOR";

  const handleAdd = async (formData: FormData) => {
    const title = formData.get("title")?.toString();

    if (!title) throw new Error("Invalid form submission");

    const response = await mutate(`/api/plays/${playId}/scenes`, "post", {
      title,
      scene_order: scenes.length + 1,
    });

    if (response.ok) {
      invalidateCache(`/api/plays/${playId}/scenes`);
      location.reload();
    }
  };

  const handleEdit = async (sceneId: number, formData: FormData) => {
    const title = formData.get("title")?.toString();
    const scene_order = Number(formData.get("scene_order"));

    if (!title || Number.isNaN(scene_order)) {
      throw new Error("Invalid form submission");
    }

    const response = await mutate(`/api/scenes/${sceneId}`, "put", {
      title,
      scene_order,
    });

    if (response.ok) {
      invalidateCache(`/api/plays/${playId}/scenes`);
      setEditing(null);
      location.reload();
    }
  };

  const handleDelete = async (sceneId: number) => {
    const response = await mutate(`/api/scenes/${sceneId}`, "delete");

    if (response.ok) {
      invalidateCache(`/api/plays/${playId}/scenes`);
      location.reload();
    }
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
              <form action={(formData) => handleEdit(scene.id, formData)}>
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
