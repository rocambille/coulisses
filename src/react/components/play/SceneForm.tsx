/*
  Purpose:
  Scenes management page (La Conduite).
  Route: /troupes/:troupeId/plays/:playId/scenes
*/

import { useParams } from "react-router";
import { useMutate } from "../../helpers/mutate";

export default function SceneForm({
  scene,
  onCancel,
  onSave,
}: {
  scene: Scene;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { playId } = useParams();
  const mutate = useMutate();

  const handleEdit = async (sceneId: Scene["id"], formData: FormData) => {
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString() ?? "";
    const cut_notes = formData.get("cut_notes")?.toString() ?? "";
    const duration = Number(formData.get("duration_estimated_seconds"));
    const order = Number(formData.get("order_in_play"));
    const is_active = formData.get("is_active") === "on";

    if (!title || Number.isNaN(order)) {
      throw new Error("Invalid form submission");
    }

    const response = await mutate(
      `/api/scenes/${sceneId}`,
      "put",
      {
        title,
        description,
        cut_notes,
        duration_estimated_seconds: duration,
        order_in_play: order,
        is_active,
      },
      [`/api/plays/${playId}/scenes`],
    );

    if (response.ok) {
      onSave();
    }
  };

  return (
    <article>
      <form action={(formData) => handleEdit(Number(scene.id), formData)}>
        <label>
          Titre
          <input
            aria-label={`Titre de la scène ${scene.id}`}
            name="title"
            defaultValue={scene.title}
            required
          />
        </label>
        <label>
          Description
          <input
            aria-label={`Description de la scène ${scene.id}`}
            name="description"
            defaultValue={scene.description}
          />
        </label>
        <div className="grid">
          <label>
            Ordre d'apparition
            <input
              aria-label={`Ordre d'apparition de la scène ${scene.id}`}
              name="order_in_play"
              type="number"
              defaultValue={scene.order_in_play}
              required
            />
          </label>
          <label>
            Durée (secondes)
            <input
              aria-label={`Durée estimée de la scène ${scene.id}`}
              name="duration_estimated_seconds"
              type="number"
              defaultValue={scene.duration_estimated_seconds}
              required
            />
          </label>
        </div>
        <label>
          Notes de coupe (cut)
          <input
            aria-label={`Notes de coupe de la scène ${scene.id}`}
            name="cut_notes"
            defaultValue={scene.cut_notes}
          />
        </label>
        <label>
          <input
            aria-label={`Scène active (incluse dans le montage) ${scene.id}`}
            name="is_active"
            type="checkbox"
            defaultChecked={scene.is_active}
          />
          Scène active (incluse dans le montage)
        </label>
        <footer style={{ marginTop: "1rem" }}>
          <button
            aria-label={`Annuler la modification de la scène ${scene.id}`}
            type="button"
            className="secondary outline"
            onClick={onCancel}
            style={{ marginRight: "0.5rem" }}
          >
            Annuler
          </button>
          <button
            aria-label={`Enregistrer les modifications de la scène ${scene.id}`}
            type="submit"
          >
            Enregistrer
          </button>
        </footer>
      </form>
    </article>
  );
}
