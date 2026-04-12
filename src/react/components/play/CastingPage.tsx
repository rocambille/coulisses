/*
  Purpose:
  Casting Matrix page — visualization and assignment.
  Route: /plays/:playId/casting
*/

import { use } from "react";
import { useParams } from "react-router";
import { cache } from "../utils";
import { useAction, useMembership } from "./hooks";

function CastingPage() {
  const { playId } = useParams();
  const runAction = useAction();
  const { isTeacher, members } = useMembership(playId);
  const matrix: CastingMatrix = use(cache(`/api/plays/${playId}/castings`));

  const handleAssign = async (roleId: number, userId: number | string) => {
    if (userId === "") {
      const currentCasting = matrix.roles.find((c) => c.id === roleId)?.user_id;
      if (currentCasting) {
        await runAction(
          `/api/plays/${playId}/castings`,
          "delete",
          {
            roleId,
            userId: currentCasting,
          },
          [`/api/plays/${playId}/castings`],
        );
      }
    } else {
      await runAction(
        `/api/plays/${playId}/castings`,
        "post",
        {
          roleId,
          userId: Number(userId),
        },
        [`/api/plays/${playId}/castings`],
      );
    }
  };

  return (
    <>
      <hgroup>
        <h2>Distribution & Casting</h2>
        <p>Matrice récapitulative des scènes et rôles.</p>
      </hgroup>

      <div className="overflow-auto">
        <table className="striped">
          <thead>
            <tr>
              <th scope="col">Distribution</th>
              {matrix.roles.map((role) => (
                <td key={role.id}>
                  {isTeacher ? (
                    <select
                      aria-label={`Assigner le rôle ${role.id}`}
                      defaultValue={role.user_id ?? ""}
                      onChange={(e) => handleAssign(role.id, e.target.value)}
                    >
                      <option value="">Non assigné</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  ) : role.user_id ? (
                    members.find((m) => m.id === role.user_id)?.name
                  ) : (
                    "—"
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="col">Scène / Rôle</th>
              {matrix.roles.map((role) => (
                <th key={role.id} scope="col" style={{ textAlign: "center" }}>
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.scenes.map((scene) => (
              <tr key={scene.id}>
                <th scope="row">
                  {scene.scene_order}. {scene.title}
                </th>
                {matrix.roles.map((role) => (
                  <td
                    key={role.id}
                    style={{
                      textAlign: "center",
                      backgroundColor: "var(--pico-ins-color)",
                    }}
                  >
                    {role.scene_ids.includes(scene.id) ? "●" : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CastingPage;
