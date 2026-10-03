/*
  Purpose:
  User Space page — lists the troupes of the logged-in user.
  Route: / (index, protected)
*/

import { use, useId, useState } from "react";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";

import { getOrFetch } from "../helpers/cache";
import { mutate } from "../helpers/mutate";
import { useMe } from "./auth/MeContext";
import { FormError, hasError } from "./FormError";
import TroupeCard from "./troupe/TroupeCard";
import Modal from "./ui/Modal";

const troupeSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string(),
  external_discussion_link: z
    .url("Le lien de discussion doit être une URL valide")
    .or(z.literal("")),
});

function DashboardPage() {
  const { user } = useMe();
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<ZodIssue[]>([]);

  const nameId = useId();
  const descriptionId = useId();
  const discussionLinkId = useId();

  const troupes: Troupe[] = use(getOrFetch<Troupe[]>("/api/troupes"));

  const handleAdd = async (formData: FormData) => {
    const parsed = troupeSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      setErrors(parsed.error.issues);
      return;
    }

    setErrors([]);
    await mutate("/api/troupes", "post", parsed.data, ["/api/troupes"]);
    setIsAdding(false);
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
          marginBottom: "1rem",
        }}
      >
        <hgroup style={{ margin: 0 }}>
          <h1>Mes troupes</h1>
          <p>Bienvenue, {user?.name}</p>
        </hgroup>

        <button
          type="button"
          aria-label="Créer une nouvelle troupe"
          onClick={() => {
            setErrors([]);
            setIsAdding(true);
          }}
          style={{ width: "auto" }}
        >
          ➕ Créer une troupe
        </button>
      </div>

      {troupes.length === 0 ? (
        <p>Tu ne fais partie d'aucune troupe pour le moment.</p>
      ) : (
        <div className="grid">
          {troupes.map((troupe) => (
            <TroupeCard key={troupe.id} troupe={troupe} />
          ))}
        </div>
      )}

      {isAdding && (
        <Modal
          title="Créer une nouvelle troupe"
          onClose={() => {
            setErrors([]);
            setIsAdding(false);
          }}
        >
          <form aria-label="Formulaire d'ajout d'une troupe" action={handleAdd}>
            <label htmlFor={nameId}>
              Nom de la troupe
              <input
                id={nameId}
                name="name"
                placeholder="Nom de la troupe"
                aria-label="Nom de la nouvelle troupe"
                required
                aria-invalid={hasError(errors, "name") || undefined}
                aria-describedby={`${nameId}-error`}
              />
              <FormError issues={errors} name="name" id={`${nameId}-error`} />
            </label>
            <label htmlFor={descriptionId}>
              Description (optionnel)
              <input
                id={descriptionId}
                name="description"
                placeholder="Description (optionnel)"
                aria-label="Description"
                aria-invalid={hasError(errors, "description") || undefined}
                aria-describedby={`${descriptionId}-error`}
              />
              <FormError
                issues={errors}
                name="description"
                id={`${descriptionId}-error`}
              />
            </label>
            <label htmlFor={discussionLinkId}>
              Lien de discussion (optionnel)
              <input
                id={discussionLinkId}
                name="external_discussion_link"
                type="url"
                placeholder="Lien de discussion (ex: WhatsApp) (optionnel)"
                aria-label="Lien de discussion externe"
                aria-invalid={
                  hasError(errors, "external_discussion_link") || undefined
                }
                aria-describedby={`${discussionLinkId}-error`}
              />
              <FormError
                issues={errors}
                name="external_discussion_link"
                id={`${discussionLinkId}-error`}
              />
            </label>
            <footer
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "end",
              }}
            >
              <button
                type="button"
                className="secondary outline"
                onClick={() => {
                  setErrors([]);
                  setIsAdding(false);
                }}
              >
                Annuler
              </button>
              <button type="submit" style={{ width: "initial" }}>
                Créer
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </>
  );
}

export default DashboardPage;
