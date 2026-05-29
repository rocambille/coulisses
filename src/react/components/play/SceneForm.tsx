/*
  Purpose:
  Scenes management page (La Conduite).
  Route: /troupes/:troupeId/plays/:playId/scenes
*/

import { useParams } from "react-router";
import z from "zod";
import { useMutate } from "../../helpers/mutate";

const sceneFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string(),
  cut_notes: z.string(),
  duration_estimated_seconds: z.int().nonnegative(),
  order_in_play: z.int(),
  is_active: z.boolean(),
});

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
    const description = formData.get("description")?.toString();
    const cut_notes = formData.get("cut_notes")?.toString();
    const duration_estimated_seconds = Number(
      formData.get("duration_estimated_seconds"),
    );
    const order_in_play = Number(formData.get("order_in_play"));
    const is_active = formData.get("is_active") === "on";

    const parsed = sceneFormSchema.safeParse({
      title,
      description,
      cut_notes,
      duration_estimated_seconds,
      order_in_play,
      is_active,
    });

    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return;
    }

    const response = await mutate(
      `/api/scenes/${sceneId}`,
      "put",
      {
        ...parsed.data,
      },
      [`/api/plays/${playId}/scenes`],
    );

    if (response.ok) {
      onSave();
    }
  };

  return (
    <form
      aria-label={`Formulaire d'édition de la scène ${scene.id}`}
      action={(formData) => handleEdit(Number(scene.id), formData)}
    >
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
            min={0}
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
  );
}
