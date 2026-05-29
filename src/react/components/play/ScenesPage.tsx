/*
  Purpose:
  Scenes management page (La Conduite).
  Route: /troupes/:troupeId/plays/:playId/scenes
*/

import React, { use, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import z from "zod";
import { cache } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";
import SceneCard from "./SceneCard";
import SceneForm from "./SceneForm";

const sceneSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
});

export default function ScenesPage() {
  const { playId } = useParams();
  const mutate = useMutate();
  const { isAdmin, scenePreferences, rolePreferences } = useOutletContext<{
    isAdmin: boolean;
    scenePreferences: ScenePreference[];
    rolePreferences: RolePreference[];
  }>();

  const [editing, setEditing] = useState<Scene["id"] | null>(null);

  const scenes = use<Scene[]>(cache(`/api/plays/${playId}/scenes`));
  const roles = use<RoleWithScenes[]>(cache(`/api/plays/${playId}/roles`));

  const handleAdd = async (formData: FormData) => {
    const parsed = sceneSchema.safeParse({
      title: formData.get("title")?.toString(),
    });

    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return;
    }

    await mutate(
      `/api/plays/${playId}/scenes`,
      "post",
      {
        title: parsed.data.title,
        description: "",
        cut_notes: "",
        duration_estimated_seconds: 0,
        order_in_play: scenes.length + 1,
        is_active: true,
      },
      [`/api/plays/${playId}/scenes`],
    );
  };

  const handleDelete = async (sceneId: Scene["id"]) => {
    if (!confirm("Supprimer cette scène ?")) return;
    await mutate(`/api/scenes/${sceneId}`, "delete", null, [
      `/api/plays/${playId}/scenes`,
    ]);
  };

  return (
    <>
      <hgroup>
        <h3>La Conduite</h3>
        <p>Organisation des scènes de la pièce et expression des envies.</p>
        <p>
          ⏱️{" "}
          {scenes.reduce(
            (acc, scene) => acc + scene.duration_estimated_seconds,
            0,
          ) / 60}
          min
        </p>
      </hgroup>

      {scenes.length === 0 ? (
        <p>Aucune scène pour le moment.</p>
      ) : (
        scenes.map((scene) => (
          <React.Fragment key={scene.id}>
            {editing === scene.id ? (
              <SceneForm
                scene={scene}
                onCancel={() => setEditing(null)}
                onSave={() => setEditing(null)}
              />
            ) : (
              <SceneCard
                scene={scene}
                roles={roles.filter((r) =>
                  r.scenes?.some((s) => s.id === scene.id),
                )}
                scenePreferences={scenePreferences}
                rolePreferences={rolePreferences}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            )}
          </React.Fragment>
        ))
      )}

      {isAdmin && (
        <details>
          <summary>Ajouter une scène</summary>
          <form aria-label="Formulaire d'ajout d'une scène" action={handleAdd}>
            <label>
              Titre
              <input name="title" required />
            </label>
            <button type="submit">Ajouter</button>
          </form>
        </details>
      )}
    </>
  );
}
