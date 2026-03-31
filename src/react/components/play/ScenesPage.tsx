/*
  Purpose:
  Scenes management page for the teacher.
  Route: /plays/:playId/scenes
*/

import { use, useState } from "react";
import { useParams } from "react-router";
import { cache, invalidateCache, mutate } from "../utils";

function ScenesPage() {
  const { playId } = useParams();
  const scenes: Scene[] = use(cache(`/api/plays/${playId}/scenes`));
  const [editing, setEditing] = useState<number | null>(null);

  const handleAdd = async (formData: FormData) => {
    const title = formData.get("title")?.toString();
    if (!title) return;

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
    if (!title) return;

    const response = await mutate(`/api/scenes/${sceneId}`, "put", {
      title,
      scene_order: scene_order || 1,
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
      <h2>Scènes</h2>

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
                <button type="submit">Enregistrer</button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEditing(null)}
                >
                  Annuler
                </button>
              </form>
            ) : (
              <>
                <header>
                  <strong>
                    {scene.scene_order}. {scene.title}
                  </strong>
                </header>
                {scene.description && <p>{scene.description}</p>}
                <footer>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setEditing(scene.id)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="contrast"
                    onClick={() => handleDelete(scene.id)}
                  >
                    Supprimer
                  </button>
                </footer>
              </>
            )}
          </article>
        ))
      )}

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
    </>
  );
}

export default ScenesPage;
