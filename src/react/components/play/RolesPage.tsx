/*
  Purpose:
  Roles management page.
  Route: /troupes/:troupeId/plays/:playId/roles
*/

import { use } from "react";
import { useOutletContext, useParams } from "react-router";
import { cache } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";
import RoleBadge from "../ui/RoleBadge";

export default function RolesPage() {
  const { playId } = useParams();
  const mutate = useMutate();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();

  const roles = use<Role[]>(cache(`/api/plays/${playId}/roles`));
  const scenes = use<Scene[]>(cache(`/api/plays/${playId}/scenes`));

  const handleAdd = async (formData: FormData) => {
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const sceneIds = formData.getAll("sceneIds").map(Number);

    if (!name) throw new Error("Invalid form submission");

    await mutate(
      `/api/plays/${playId}/roles`,
      "post",
      { name, description, sceneIds },
      [`/api/plays/${playId}/roles`],
    );
  };

  const handleDelete = async (roleId: Role["id"]) => {
    if (!confirm("Supprimer ce rôle ?")) return;
    await mutate(`/api/roles/${roleId}`, "delete", undefined, [
      `/api/plays/${playId}/roles`,
    ]);
  };

  return (
    <>
      <hgroup>
        <h3>Rôles</h3>
        <p>Définition des rôles de la pièce.</p>
      </hgroup>

      {roles.length === 0 ? (
        <p>Aucun rôle défini.</p>
      ) : (
        <div className="grid">
          {roles.map((role) => (
            <article key={role.id}>
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>
                  <RoleBadge name={role.name} />
                </strong>
              </header>
              {role.description && (
                <p>
                  <em>{role.description}</em>
                </p>
              )}
              {isAdmin && (
                <footer style={{ marginTop: "1rem" }}>
                  <button
                    aria-label={`Supprimer le rôle ${role.id}`}
                    type="button"
                    className="contrast outline"
                    onClick={() => handleDelete(role.id)}
                  >
                    Supprimer
                  </button>
                </footer>
              )}
            </article>
          ))}
        </div>
      )}

      {isAdmin && (
        <details>
          <summary>Ajouter un rôle</summary>
          <form action={handleAdd}>
            <label htmlFor="role-name">Nom du rôle</label>
            <input id="role-name" name="name" required />
            <label htmlFor="role-description">Description (optionnel)</label>
            <input id="role-description" name="description" />

            <fieldset>
              <legend>Présent dans quelles scènes ?</legend>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid var(--pico-muted-border-color)",
                  padding: "0.5rem",
                  borderRadius: "0.25rem",
                }}
              >
                {scenes.map((scene) => (
                  <label
                    key={scene.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="sceneIds"
                      value={Number(scene.id)}
                    />
                    <span>
                      {scene.order_in_play}. {scene.title}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit" style={{ marginTop: "1rem" }}>
              Ajouter
            </button>
          </form>
        </details>
      )}
    </>
  );
}
