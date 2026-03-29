/*
  Purpose:
  Dashboard page — lists the plays of the logged-in user.
  Route: / (index, protected)
*/

import { use } from "react";
import { Navigate, NavLink } from "react-router";
import { useAuth } from "./auth/AuthContext";
import { cache } from "./utils";

function DashboardPage() {
  const { user, check } = useAuth();

  if (!check()) {
    return <Navigate to="/login" replace />;
  }

  const plays: Play[] = use(cache("/api/plays"));

  return (
    <>
      <hgroup>
        <h1>Mes Pièces</h1>
        <p>Bienvenue, {user?.name} !</p>
      </hgroup>

      {plays.length === 0 ? (
        <p>Tu ne fais partie d'aucune pièce pour le moment.</p>
      ) : (
        <div>
          {plays.map((play) => (
            <article key={play.id}>
              <header>
                <NavLink to={`/plays/${play.id}/scenes`}>
                  <strong>{play.title}</strong>
                </NavLink>
              </header>
              {play.description && <p>{play.description}</p>}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default DashboardPage;
