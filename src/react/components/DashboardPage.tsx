/*
  Purpose:
  Dashboard page — lists the plays of the logged-in user.
  Route: / (index, protected)
*/

import { use } from "react";
import { NavLink } from "react-router";
import { useAuth } from "./auth/AuthContext";
import { cache, invalidateCache, mutate } from "./utils";

function DashboardPage() {
  const { me } = useAuth();

  if (!me) throw new Error("User not authenticated");

  const plays: Play[] = use(cache("/api/plays"));

  const handleAdd = async (formData: FormData) => {
    const title = formData.get("title")?.toString();

    if (!title) throw new Error("Invalid form submission");

    const response = await mutate("/api/plays", "post", {
      title,
    });

    if (response.ok) {
      invalidateCache("/api/plays");
      location.reload();
    }
  };

  return (
    <>
      <hgroup>
        <h1>Mes Pièces</h1>
        <p>{me.name}</p>
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

      <details>
        <summary>Ajouter une pièce</summary>
        <form action={handleAdd}>
          <input
            name="title"
            placeholder="Titre de la pièce"
            aria-label="Titre de la nouvelle pièce"
            required
          />
          <button type="submit">Ajouter</button>
        </form>
      </details>
    </>
  );
}

export default DashboardPage;
