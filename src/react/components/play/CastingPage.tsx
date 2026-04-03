/*
  Purpose:
  Casting Matrix page — visualization and assignment.
  Route: /plays/:playId/casting
*/

import { use } from "react";
import { useParams } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { cache, invalidateCache, mutate } from "../utils";

function CastingPage() {
  const { playId } = useParams();
  const { me } = useAuth();
  const matrix: CastingMatrix = use(cache(`/api/plays/${playId}/castings`));
  const members: (User & { role: string })[] = use(
    cache(`/api/plays/${playId}/members`),
  );

  const isTeacher =
    members.find((member) => member.id === me?.id)?.role === "TEACHER";

  const handleAssign = async (roleId: number, userId: number | string) => {
    if (userId === "") {
      const currentCasting = matrix.castings.find((c) => c.role_id === roleId);
      if (currentCasting) {
        await mutate(`/api/plays/${playId}/castings`, "delete", {
          roleId,
          userId: currentCasting.user_id,
        });
      }
    } else {
      await mutate(`/api/plays/${playId}/castings`, "post", {
        roleId,
        userId: Number(userId),
      });
    }

    invalidateCache(`/api/plays/${playId}/castings`);
    location.reload();
  };

  const getPreferenceLevel = (userId: number, sceneId: number) => {
    return matrix.preferences.find(
      (p) => p.user_id === userId && p.scene_id === sceneId,
    )?.level;
  };

  const getPreferenceColor = (level?: string) => {
    switch (level) {
      case "HIGH":
        return "var(--pico-ins-color)";
      case "MEDIUM":
        return "var(--pico-keyword-color)";
      case "LOW":
        return "var(--pico-del-color)";
      default:
        return "transparent";
    }
  };

  return (
    <>
      <hgroup>
        <h2>Distribution & Casting</h2>
        <p>Matrice récapitulative des scènes, rôles et préférences.</p>
      </hgroup>

      <div className="overflow-auto">
        <table className="striped">
          <thead>
            <tr>
              <th scope="col">Scène / Rôle</th>
              {members
                .filter((m) => m.role === "ACTOR")
                .map((member) => (
                  <th
                    key={member.id}
                    scope="col"
                    style={{ textAlign: "center" }}
                  >
                    {member.name}
                  </th>
                ))}
              <th scope="col">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {matrix.scenes.map((scene) => (
              <tr key={scene.id}>
                <th scope="row">
                  {scene.scene_order}. {scene.title}
                </th>
                {members.map((member) => (
                  <td
                    key={member.id}
                    style={{
                      textAlign: "center",
                      backgroundColor: getPreferenceColor(
                        getPreferenceLevel(member.id, scene.id),
                      ),
                    }}
                  >
                    {getPreferenceLevel(member.id, scene.id) ? "●" : ""}
                  </td>
                ))}
                <td>—</td>
              </tr>
            ))}
            <tr
              style={{ backgroundColor: "var(--pico-card-background-color)" }}
            >
              <td
                colSpan={members.filter((m) => m.role === "ACTOR").length + 2}
              >
                <strong>Attribution des Rôles</strong>
              </td>
            </tr>
            {matrix.roles.map((role) => (
              <tr key={role.id}>
                <th scope="row" style={{ paddingLeft: "1.5rem" }}>
                  🎭 {role.name}
                </th>
                <td
                  colSpan={members.filter((m) => m.role === "ACTOR").length}
                />
                <td>
                  <select
                    aria-label={`Assigner le rôle ${role.name}`}
                    defaultValue={
                      matrix.castings.find((c) => c.role_id === role.id)
                        ?.user_id ?? ""
                    }
                    onChange={(e) => handleAssign(role.id, e.target.value)}
                    disabled={!isTeacher}
                  >
                    <option value="">Non assigné</option>
                    {members
                      .filter((member) => member.role === "ACTOR")
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CastingPage;
