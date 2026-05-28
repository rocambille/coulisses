/*
  Purpose:
  User Space page — lists the troupes of the logged-in user.
  Route: / (index, protected)
*/

import { use } from "react";
import z from "zod";

import { cache } from "../helpers/cache";
import { useMutate } from "../helpers/mutate";
import { useAuth } from "./auth/AuthContext";
import TroupeCard from "./troupe/TroupeCard";

const troupeSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string(),
  external_discussion_link: z.url().or(z.literal("")),
});

function DashboardPage() {
  const { me } = useAuth();
  const mutate = useMutate();

  const troupes: Troupe[] = use(cache("/api/troupes"));

  const handleAdd = async (formData: FormData) => {
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const external_discussion_link = formData
      .get("external_discussion_link")
      ?.toString();

    const parsed = troupeSchema.safeParse({
      name,
      description,
      external_discussion_link,
    });

    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return;
    }

    await mutate("/api/troupes", "post", parsed.data, ["/api/troupes"]);
  };

  return (
    <>
      <hgroup>
        <h1>Mes troupes</h1>
        <p>Bienvenue, {me?.name}</p>
      </hgroup>

      {troupes.length === 0 ? (
        <p>Tu ne fais partie d'aucune troupe pour le moment.</p>
      ) : (
        <div className="grid">
          {troupes.map((troupe) => (
            <TroupeCard key={troupe.id} troupe={troupe} />
          ))}
        </div>
      )}

      <details>
        <summary>Créer une nouvelle troupe</summary>
        <form aria-label="troupe form" action={handleAdd}>
          <input
            name="name"
            placeholder="Nom de la troupe"
            aria-label="Nom de la nouvelle troupe"
            required
          />
          <input
            name="description"
            placeholder="Description (optionnel)"
            aria-label="Description"
          />
          <input
            name="external_discussion_link"
            type="url"
            placeholder="Lien de discussion (ex: WhatsApp) (optionnel)"
            aria-label="Lien de discussion externe"
          />
          <button type="submit">Créer</button>
        </form>
      </details>
    </>
  );
}

export default DashboardPage;
