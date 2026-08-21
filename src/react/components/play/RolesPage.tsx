/*
  Purpose:
  Roles management page.
  Route: /troupes/:troupeId/plays/:playId/roles
*/

import { use, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { getOrFetch } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";
import Modal from "../ui/Modal";
import RoleBadge from "../ui/RoleBadge";
import RoleForm, { type RoleFormData } from "./RoleForm";

export default function RolesPage() {
  const { playId } = useParams();
  const mutate = useMutate();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();

  const [editingRole, setEditingRole] = useState<RoleWithScenes | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const roles = use(getOrFetch<RoleWithScenes[]>(`/api/plays/${playId}/roles`));
  const scenes = use(getOrFetch<Scene[]>(`/api/plays/${playId}/scenes`));

  const handleAdd = async (data: RoleFormData) => {
    await mutate(`/api/plays/${playId}/roles`, "post", data, [
      `/api/plays/${playId}/roles`,
      `/api/plays/${playId}/scenes`,
    ]);
    setIsAdding(false);
  };

  const handleEdit = async (data: RoleFormData) => {
    if (!editingRole) return;

    await mutate(`/api/roles/${editingRole.id}`, "put", data, [
      `/api/plays/${playId}/roles`,
      `/api/plays/${playId}/scenes`,
    ]);

    setEditingRole(null);
  };

  const handleDelete = async (roleId: RoleWithScenes["id"]) => {
    if (!confirm("Supprimer ce rôle ?")) return;
    await mutate(`/api/roles/${roleId}`, "delete", undefined, [
      `/api/plays/${playId}/roles`,
      `/api/plays/${playId}/scenes`,
    ]);
  };

  const emptyRole: RoleFormData = {
    name: "",
    description: "",
    sceneIds: [],
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
          <h3>Rôles</h3>
          <p>Définition des rôles de la pièce.</p>
        </hgroup>

        {isAdmin && (
          <button
            type="button"
            aria-label="Ajouter un rôle"
            onClick={() => setIsAdding(true)}
            style={{ width: "auto" }}
          >
            ➕ Ajouter un rôle
          </button>
        )}
      </div>

      {roles.length === 0 ? (
        <p>Aucun rôle défini.</p>
      ) : (
        <div className="grid">
          {roles.map((role) => (
            <article key={role.id}>
              <header>
                <strong>
                  <RoleBadge name={role.name} />
                </strong>
              </header>
              <p>
                <em>{role.description || "Aucune description"}</em>
              </p>
              {isAdmin && (
                <footer
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    aria-label={`Modifier le rôle ${role.id}`}
                    type="button"
                    className="secondary outline"
                    onClick={() => setEditingRole(role)}
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "smaller",
                      width: "auto",
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    aria-label={`Supprimer le rôle ${role.id}`}
                    type="button"
                    className="contrast outline"
                    onClick={() => handleDelete(role.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "smaller",
                      width: "auto",
                    }}
                  >
                    Supprimer
                  </button>
                </footer>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <Modal title="Ajouter un rôle" onClose={() => setIsAdding(false)}>
          <RoleForm
            role={emptyRole}
            scenes={scenes}
            onCancel={() => setIsAdding(false)}
            onSave={handleAdd}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingRole && (
        <Modal
          title={`Modifier le rôle ${editingRole.name}`}
          onClose={() => setEditingRole(null)}
        >
          <RoleForm
            role={{
              name: editingRole.name,
              description: editingRole.description,
              sceneIds: editingRole.scenes?.map((s) => Number(s.id)) ?? [],
            }}
            scenes={scenes}
            onCancel={() => setEditingRole(null)}
            onSave={handleEdit}
          />
        </Modal>
      )}
    </>
  );
}
