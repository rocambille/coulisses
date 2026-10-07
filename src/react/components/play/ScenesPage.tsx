/*
  Purpose:
  Scenes management page (La Conduite).
  Route: /troupes/:troupeId/plays/:playId/scenes
*/

import { use, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { getOrFetch } from "../../helpers/cache";
import { mutate } from "../../helpers/mutate";
import Modal from "../ui/Modal";
import SceneCard from "./SceneCard";
import SceneForm, { type SceneFormData } from "./SceneForm";

export default function ScenesPage() {
  const { playId } = useParams();
  const { isAdmin, scenePreferences, rolePreferences } = useOutletContext<{
    isAdmin: boolean;
    scenePreferences: ScenePreference[];
    rolePreferences: RolePreference[];
  }>();

  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const scenes = use<Scene[]>(getOrFetch(`/api/plays/${playId}/scenes`));
  const roles = use<RoleWithScenes[]>(getOrFetch(`/api/plays/${playId}/roles`));

  const handleAdd = async (data: SceneFormData) => {
    await mutate(`/api/plays/${playId}/scenes`, "post", data, [
      `/api/plays/${playId}/scenes`,
      `/api/plays/${playId}/roles`,
    ]);
    setIsAdding(false);
  };

  const handleEdit = async (data: SceneFormData) => {
    if (!editingScene) return;

    await mutate(`/api/scenes/${editingScene.id}`, "put", data, [
      `/api/plays/${playId}/scenes`,
      `/api/plays/${playId}/roles`,
    ]);
    setEditingScene(null);
  };

  const handleDelete = async (sceneId: Scene["id"]) => {
    if (!confirm("Supprimer cette scène ?")) return;
    await mutate(`/api/scenes/${sceneId}`, "delete", null, [
      `/api/plays/${playId}/scenes`,
      `/api/plays/${playId}/roles`,
    ]);
  };

  const emptyScene: SceneFormData = {
    title: "",
    description: "",
    cut_notes: "",
    duration_estimated_seconds: 0,
    order_in_play: scenes.length + 1,
    is_active: true,
    roleIds: [],
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
          <h3>La pièce</h3>
          <p>Organisation des scènes de la pièce et expression des envies.</p>
          <p>
            ⏱️{" "}
            {scenes.reduce(
              (acc, scene) => acc + scene.duration_estimated_seconds,
              0,
            ) / 60}{" "}
            min
          </p>
        </hgroup>

        {isAdmin && (
          <button
            type="button"
            aria-label="Ajouter une scène"
            onClick={() => setIsAdding(true)}
            style={{ width: "auto" }}
          >
            ➕ Ajouter une scène
          </button>
        )}
      </div>

      {scenes.length === 0 ? (
        <p className="empty-state">
          <strong>Aucune scène pour le moment.</strong>
          Ajoutez une scène pour commencer à organiser la pièce.
        </p>
      ) : (
        scenes.map((scene) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            roles={roles.filter((r) =>
              r.scenes?.some((s) => s.id === scene.id),
            )}
            scenePreferences={scenePreferences}
            rolePreferences={rolePreferences}
            onEdit={(id) => {
              const target = scenes.find((s) => s.id === id);
              if (target) setEditingScene(target);
            }}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Add Modal */}
      {isAdding && (
        <Modal title="Ajouter une scène" onClose={() => setIsAdding(false)}>
          <SceneForm
            scene={emptyScene}
            roles={roles}
            onCancel={() => setIsAdding(false)}
            onSave={handleAdd}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingScene && (
        <Modal
          title={`Modifier la scène ${editingScene.title}`}
          onClose={() => setEditingScene(null)}
        >
          <SceneForm
            scene={{
              ...editingScene,
              roleIds: roles
                .filter((r) => r.scenes?.some((s) => s.id === editingScene.id))
                .map((r) => r.id),
            }}
            roles={roles}
            onCancel={() => setEditingScene(null)}
            onSave={handleEdit}
          />
        </Modal>
      )}
    </>
  );
}
