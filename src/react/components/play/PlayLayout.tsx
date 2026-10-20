/*
  Purpose:
  Shared layout for a specific play.
  Provides internal navigation (Scènes, Rôles, Casting) and fetches play data.
  Route: /troupes/:troupeId/plays/:playId
*/

import { use, useEffect } from "react";
import {
  Link,
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { getOrFetch } from "../../helpers/cache";
import { mutate } from "../../helpers/mutate";

export default function PlayLayout() {
  const navigate = useNavigate();
  const { troupeId, playId } = useParams();
  const {
    troupe,
    members,
    isAdmin,
    scenePreferences,
    rolePreferences,
    pushBreadcrumb,
  } = useOutletContext<{
    troupe: Troupe;
    members: TroupeMember[];
    isAdmin: boolean;
    scenePreferences: ScenePreference[];
    rolePreferences: RolePreference[];
    pushBreadcrumb: (breadcrumb: NavItem[]) => void;
  }>();

  // Use the cached play fetched at the Troupe level if possible, or fetch it directly.
  const play = use(getOrFetch<Play>(`/api/plays/${playId}`));

  useEffect(() => {
    pushBreadcrumb([
      {
        to: `/troupes/${troupeId}/plays/${playId}`,
        label: play.title,
      },
    ]);

    return () => {
      pushBreadcrumb([]);
    };
  }, [playId, troupeId, play.title, pushBreadcrumb]);

  const handleDeletePlay = async () => {
    if (
      !confirm(
        `Supprimer la pièce "${play.title}" ? Toutes les scènes, rôles et documents associés seront supprimés.`,
      )
    ) {
      return;
    }
    await mutate(`/api/plays/${playId}`, "delete", null, [
      `/api/troupes/${troupeId}/plays`,
    ]);
    navigate(`/troupes/${troupeId}`, { replace: true });
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
        }}
      >
        <hgroup style={{ margin: 0 }}>
          <h2>{play.title}</h2>
          <p>{play.description}</p>
        </hgroup>
        {isAdmin && (
          <button
            type="button"
            className="contrast outline"
            aria-label={`Supprimer la pièce ${play.id}`}
            style={{ width: "auto", fontSize: "smaller" }}
            onClick={handleDeletePlay}
          >
            Supprimer la pièce
          </button>
        )}
      </div>

      <nav>
        <ul>
          <li>
            <Link to={`/troupes/${troupeId}/plays/${playId}/scenes`}>
              Scènes & Envies
            </Link>
          </li>
          <li>
            <Link to={`/troupes/${troupeId}/plays/${playId}/roles`}>Rôles</Link>
          </li>
          <li>
            <Link to={`/troupes/${troupeId}/plays/${playId}/casting`}>
              Distribution
            </Link>
          </li>
          <li>
            <Link to={`/troupes/${troupeId}/plays/${playId}/documents`}>
              Documents
            </Link>
          </li>
        </ul>
      </nav>

      <Outlet
        context={{
          play,
          troupe,
          members,
          isAdmin,
          scenePreferences,
          rolePreferences,
        }}
      />
    </>
  );
}
