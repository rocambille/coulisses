/*
  Purpose:
  Roles management page.
  Route: /troupes/:troupeId/plays/:playId/roles
*/

import { use, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import z from "zod";
import { getOrFetch } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";
import RoleBadge from "../ui/RoleBadge";

const roleFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string(),
  sceneIds: z.array(z.number()),
});

export default function RolesPage() {
  const { playId } = useParams();
  const mutate = useMutate();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();

  const [editing, setEditing] = useState<RoleWithScenes["id"] | null>(null);

  const roles = use(getOrFetch<RoleWithScenes[]>(`/api/plays/${playId}/roles`));
  const scenes = use(getOrFetch<Scene[]>(`/api/plays/${playId}/scenes`));

  const handleAdd = async (formData: FormData) => {
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const sceneIds = formData.getAll("sceneIds").map(Number);

    const parsed = roleFormSchema.safeParse({
      name,
      description,
      sceneIds,
    });

    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return;
    }

    await mutate(`/api/plays/${playId}/roles`, "post", { ...parsed.data }, [
      `/api/plays/${playId}/roles`,
      `/api/plays/${playId}/scenes`,
    ]);
  };

  const handleEdit = async (
    roleId: RoleWithScenes["id"],
    formData: FormData,
  ) => {
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const sceneIds = formData.getAll("sceneIds").map(Number);

    const parsed = roleFormSchema.safeParse({
      name,
      description,
      sceneIds,
    });

    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return;
    }

    await mutate(`/api/roles/${roleId}`, "put", { ...parsed.data }, [
      `/api/plays/${playId}/roles`,
      `/api/plays/${playId}/scenes`,
    ]);

    setEditing(null);
  };

  const handleDelete = async (roleId: RoleWithScenes["id"]) => {
    if (!confirm("Supprimer ce rôle ?")) return;
    await mutate(`/api/roles/${roleId}`, "delete", undefined, [
      `/api/plays/${playId}/roles`,
      `/api/plays/${playId}/scenes`,
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
          {roles.map((role) =>
            editing === role.id ? (
              <article key={role.id}>
                <form
                  aria-label={`Formulaire d'édition du rôle ${role.id}`}
                  action={(formData) => handleEdit(role.id, formData)}
                >
                  <label htmlFor={`edit-role-name-${role.id}`}>
                    Nom du rôle
                  </label>
                  <input
                    id={`edit-role-name-${role.id}`}
                    aria-label={`Nom du rôle ${role.id}`}
                    name="name"
                    defaultValue={role.name}
                    required
                  />
                  <label htmlFor={`edit-role-description-${role.id}`}>
                    Description (optionnel)
                  </label>
                  <input
                    id={`edit-role-description-${role.id}`}
                    aria-label={`Description du rôle ${role.id}`}
                    name="description"
                    defaultValue={role.description}
                  />

                  <fieldset>
                    <legend>Présent dans quelles scènes ?</legend>
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
                          defaultChecked={role.scenes?.some(
                            (s) => s.id === scene.id,
                          )}
                        />
                        <span>
                          {scene.order_in_play}. {scene.title}
                        </span>
                      </label>
                    ))}
                  </fieldset>

                  <footer
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "0.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    <button
                      aria-label={`Annuler la modification du rôle ${role.id}`}
                      type="button"
                      className="secondary outline"
                      onClick={() => setEditing(null)}
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "smaller",
                        width: "auto",
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      aria-label={`Enregistrer les modifications du rôle ${role.id}`}
                      type="submit"
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "smaller",
                        width: "auto",
                      }}
                    >
                      Enregistrer
                    </button>
                  </footer>
                </form>
              </article>
            ) : (
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
                      onClick={() => setEditing(role.id)}
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
            ),
          )}
        </div>
      )}

      {isAdmin && (
        <details>
          <summary>Ajouter un rôle</summary>
          <form aria-label="Formulaire d'ajout d'un rôle" action={handleAdd}>
            <label htmlFor="role-name">Nom du rôle</label>
            <input id="role-name" name="name" required />
            <label htmlFor="role-description">Description (optionnel)</label>
            <input id="role-description" name="description" />

            <fieldset>
              <legend>Présent dans quelles scènes ?</legend>
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
