/*
  Purpose:
  Roles management page for the teacher.
  Route: /plays/:playId/roles
*/

import { use } from "react";
import { useParams } from "react-router";
import { cache } from "../utils";
import { useAction, useMembership } from "./hooks";

function RolesPage() {
  const { playId } = useParams();
  const runAction = useAction();
  const { isTeacher } = useMembership(playId);

  const roles: RoleWithScenes[] = use(cache(`/api/plays/${playId}/roles`));
  const scenes: Scene[] = use(cache(`/api/plays/${playId}/scenes`));

  const handleAdd = async (formData: FormData) => {
    const name = formData.get("name")?.toString();

    if (!name) throw new Error("Invalid form submission");

    const description = formData.get("description")?.toString() || null;
    const sceneIds = formData.getAll("sceneIds").map(Number);

    await runAction(
      `/api/plays/${playId}/roles`,
      "post",
      {
        name,
        description,
        sceneIds,
      },
      [`/api/plays/${playId}/roles`],
    );
  };

  return (
    <>
      <h2>Rôles</h2>

      {roles.length === 0 ? (
        <p>Aucun rôle pour le moment.</p>
      ) : (
        roles.map((role) => (
          <article key={role.id}>
            <header>
              <strong>{role.name}</strong>
            </header>
            {role.description && <p>{role.description}</p>}
            <footer>
              Scènes : {role.scenes.map((scene) => scene.title).join(", ")}
            </footer>
          </article>
        ))
      )}

      {isTeacher && (
        <details>
          <summary>Ajouter un rôle</summary>
          <form action={handleAdd}>
            <input
              name="name"
              placeholder="Nom du rôle"
              aria-label="Nom du rôle"
              required
            />
            <input
              name="description"
              placeholder="Description (optionnel)"
              aria-label="Description du rôle"
            />
            <fieldset>
              <legend>Scènes associées</legend>
              {scenes.map((scene) => (
                <label key={scene.id}>
                  <input type="checkbox" name="sceneIds" value={scene.id} />
                  {scene.title}
                </label>
              ))}
            </fieldset>
            <button type="submit">Ajouter</button>
          </form>
        </details>
      )}
    </>
  );
}

export default RolesPage;
