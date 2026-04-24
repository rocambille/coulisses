/*
  Purpose:
  Shared layout for a specific play.
  Provides internal navigation (Scènes, Rôles, Membres) and fetches play data.
  Route: /plays/:playId
*/

import { use } from "react";
import { NavLink, Outlet, useParams } from "react-router";
import { cache } from "../../helpers/cache";

function PlayLayout() {
  const { playId } = useParams();

  const play: Play = use(cache(`/api/plays/${playId}`));

  return (
    <>
      <hgroup>
        <h1>{play.title}</h1>
        {play.description && <p>{play.description}</p>}
      </hgroup>

      <nav>
        <ul>
          <li>
            <NavLink to={`/plays/${playId}/scenes`}>Scènes</NavLink>
          </li>
          <li>
            <NavLink to={`/plays/${playId}/roles`}>Rôles</NavLink>
          </li>
          <li>
            <NavLink to={`/plays/${playId}/casting`}>Distribution</NavLink>
          </li>
          <li>
            <NavLink to={`/plays/${playId}/calendar`}>Agenda</NavLink>
          </li>
          <li>
            <NavLink to={`/plays/${playId}/members`}>Membres</NavLink>
          </li>
        </ul>
      </nav>

      <Outlet context={{ play }} />
    </>
  );
}

export default PlayLayout;
