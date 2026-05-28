/*
  Purpose:
  Casting Dashboard (La Matrice de Distribution).
  Route: /troupes/:troupeId/plays/:playId/casting
*/

import React, { use } from "react";
import { useOutletContext, useParams } from "react-router";
import { cache } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";
import PreferenceBadge from "../ui/PreferenceBadge";

export default function CastingPage() {
  const { playId } = useParams();
  const mutate = useMutate();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();

  if (!playId) return null;

  // The matrix directly provides actors and scenes with roles and preferences
  const dashboard = use<CastingMatrix>(cache(`/api/plays/${playId}/castings`));
  // dashboard object is: { actors: User[], scenes: Array<{ id, title, order_in_play, roles: Array<{ id, name, is_assigned, assigned_user_id, assigned_user_name, preferences: Array<{ user_id, level }> }> }> }

  const actors = dashboard.actors;
  const scenes = dashboard.scenes;

  const handleAssign = async (sceneId: RowId, roleId: RowId, userId: RowId) => {
    if (!isAdmin) return;

    await mutate(
      `/api/castings`,
      "post",
      { scene_id: sceneId, role_id: roleId, user_id: userId },
      [`/api/plays/${playId}/castings`],
    );
  };

  const handleUnassign = async (
    sceneId: RowId,
    roleId: RowId,
    userId: RowId,
  ) => {
    if (!isAdmin) return;

    await mutate(
      `/api/castings`,
      "delete",
      { scene_id: sceneId, role_id: roleId, user_id: userId },
      [`/api/plays/${playId}/castings`],
    );
  };

  return (
    <>
      <hgroup>
        <h3>Distribution</h3>
        <p>Croisement des scènes, rôles et acteurs.</p>
      </hgroup>

      <div style={{ overflowX: "auto" }}>
        <table className="striped">
          <thead>
            <tr>
              <th style={{ minWidth: "150px" }}>Scène</th>
              <th style={{ minWidth: "100px" }}>Rôle</th>
              <th>Assigné(e)</th>
              {actors.map((actor) => (
                <th key={actor.id} style={{ textAlign: "center" }}>
                  {actor.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenes.map((scene) => (
              <React.Fragment key={scene.id}>
                {scene.roles.map((role, roleIndex) => {
                  const assignedUser = role.assigned_user;
                  return (
                    <tr key={`${scene.id}-${role.id}`}>
                      {roleIndex === 0 ? (
                        <td
                          rowSpan={scene.roles.length}
                          style={{
                            verticalAlign: "middle",
                            fontWeight: "bold",
                          }}
                        >
                          {scene.order_in_play}. {scene.title}
                        </td>
                      ) : null}
                      <td>{role.name}</td>
                      <td>
                        {assignedUser ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              style={{
                                color: "var(--pico-color-emerald-500)",
                                fontWeight: "bold",
                              }}
                            >
                              {assignedUser.name}
                            </span>
                            {isAdmin && (
                              <button
                                aria-label={`Désassigner le rôle ${role.id} dans la scène ${scene.id} à ${assignedUser.id}`}
                                type="button"
                                className="outline secondary"
                                style={{
                                  padding: "0.1rem 0.3rem",
                                  fontSize: "0.7rem",
                                  width: "auto",
                                  margin: 0,
                                }}
                                onClick={() =>
                                  handleUnassign(
                                    scene.id,
                                    role.id,
                                    assignedUser.id,
                                  )
                                }
                                title="Désassigner"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--pico-muted-color)" }}>
                            Personne
                          </span>
                        )}
                      </td>
                      {actors.map((actor) => {
                        const pref = role.preferences.find(
                          (p) => p.user_id === actor.id,
                        );
                        return (
                          <td key={actor.id} style={{ textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.2rem",
                              }}
                            >
                              {pref ? (
                                <PreferenceBadge level={pref.level} />
                              ) : (
                                <span
                                  style={{ color: "var(--pico-muted-color)" }}
                                >
                                  -
                                </span>
                              )}

                              {isAdmin && !role.assigned_user && (
                                <button
                                  aria-label={`Assigner le rôle ${role.id} dans la scène ${scene.id} à ${actor.id}`}
                                  type="button"
                                  className="outline"
                                  style={{
                                    padding: "0.1rem 0.3rem",
                                    fontSize: "0.6rem",
                                    width: "auto",
                                    margin: 0,
                                  }}
                                  onClick={() =>
                                    handleAssign(scene.id, role.id, actor.id)
                                  }
                                >
                                  Assigner
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
