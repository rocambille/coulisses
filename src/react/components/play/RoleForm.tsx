/*
  Purpose:
  Form component to create or edit a Role.
  Collects data, validates against schema, and calls onSave.
*/

import { useId, useState } from "react";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";

import { FormError, hasError } from "../FormError";

export const roleFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string(),
  sceneIds: z.array(z.coerce.number()),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;

export default function RoleForm({
  role,
  scenes,
  onCancel,
  onSave,
}: {
  role: RoleFormData;
  scenes: Scene[];
  onCancel: () => void;
  onSave: (data: RoleFormData) => void | Promise<void>;
}) {
  const [errors, setErrors] = useState<ZodIssue[]>([]);
  const nameId = useId();
  const descriptionId = useId();

  const handleSubmit = (formData: FormData) => {
    const parsed = roleFormSchema.safeParse({
      ...Object.fromEntries(formData),
      sceneIds: formData.getAll("sceneIds"),
    });

    if (!parsed.success) {
      setErrors(parsed.error.issues);
      return;
    }

    setErrors([]);
    onSave(parsed.data);
  };

  return (
    <form aria-label="Formulaire de rôle" action={handleSubmit}>
      <label htmlFor={nameId}>
        Nom du rôle
        <input
          id={nameId}
          name="name"
          aria-label="Nom du rôle"
          defaultValue={role.name}
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
          aria-label="Description du rôle"
          defaultValue={role.description}
          aria-invalid={hasError(errors, "description") || undefined}
          aria-describedby={`${descriptionId}-error`}
        />
        <FormError
          issues={errors}
          name="description"
          id={`${descriptionId}-error`}
        />
      </label>

      <fieldset>
        <legend>Présent dans quelles scènes ?</legend>
        {scenes.length === 0 ? (
          <p
            style={{
              color: "var(--pico-muted-color)",
              fontSize: "smaller",
            }}
          >
            Aucune scène définie pour cette pièce.
          </p>
        ) : (
          scenes.map((scene) => (
            <label
              key={scene.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <input
                type="checkbox"
                name="sceneIds"
                value={Number(scene.id)}
                defaultChecked={role.sceneIds.includes(Number(scene.id))}
              />
              <span>
                {scene.order_in_play}. {scene.title}
              </span>
            </label>
          ))
        )}
      </fieldset>

      <footer
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.5rem",
          justifyContent: "end",
        }}
      >
        <button
          aria-label="Annuler"
          type="button"
          className="secondary outline"
          onClick={onCancel}
        >
          Annuler
        </button>
        <button
          aria-label="Enregistrer"
          type="submit"
          style={{ width: "initial" }}
        >
          Enregistrer
        </button>
      </footer>
    </form>
  );
}
