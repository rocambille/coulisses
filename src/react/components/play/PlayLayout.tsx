/*
  Purpose:
  Shared layout for a specific play.
  Provides internal navigation (Scènes, Rôles, Casting) and fetches play data.
  Route: /troupes/:troupeId/plays/:playId
*/

import { use, useEffect } from "react";
import { Link, Outlet, useOutletContext, useParams } from "react-router";
import { cache } from "../../helpers/cache";

export default function PlayLayout() {
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
  const play = use<Play>(cache(`/api/plays/${playId}`));

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

  return (
    <>
      <hgroup>
        <h2>{play.title}</h2>
        <p>{play.description}</p>
      </hgroup>

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
