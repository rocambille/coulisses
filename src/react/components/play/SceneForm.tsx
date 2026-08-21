/*
  Purpose:
  Form component to create or edit a Scene.
  Collects data, validates against schema, and calls onSave.
*/

import { useId, useState } from "react";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";

import { FormError, hasError } from "../FormError";

export const sceneFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string(),
  cut_notes: z.string(),
  duration_estimated_seconds: z.coerce
    .number()
    .nonnegative("La durée doit être positive ou nulle"),
  order_in_play: z.coerce.number(),
  is_active: z.coerce.boolean(),
  roleIds: z.array(z.coerce.number()),
});

export type SceneFormData = z.infer<typeof sceneFormSchema>;

export default function SceneForm({
  scene,
  roles,
  onCancel,
  onSave,
}: {
  scene: SceneFormData;
  roles: RoleWithScenes[];
  onCancel: () => void;
  onSave: (data: SceneFormData) => void | Promise<void>;
}) {
  const [errors, setErrors] = useState<ZodIssue[]>([]);

  const titleId = useId();
  const descriptionId = useId();
  const orderId = useId();
  const durationId = useId();
  const cutNotesId = useId();

  const handleSubmit = (formData: FormData) => {
    const parsed = sceneFormSchema.safeParse({
      ...Object.fromEntries(formData),
      roleIds: formData.getAll("roleIds"),
    });

    if (!parsed.success) {
      setErrors(parsed.error.issues);
      return;
    }

    setErrors([]);
    onSave(parsed.data);
  };

  return (
    <form aria-label="Formulaire de scène" action={handleSubmit}>
      <label htmlFor={titleId}>
        Titre
        <input
          id={titleId}
          aria-label="Titre de la scène"
          name="title"
          defaultValue={scene.title}
          required
          aria-invalid={hasError(errors, "title") || undefined}
          aria-describedby={`${titleId}-error`}
        />
        <FormError issues={errors} name="title" id={`${titleId}-error`} />
      </label>
      <label htmlFor={descriptionId}>
        Description
        <input
          id={descriptionId}
          aria-label="Description de la scène"
          name="description"
          defaultValue={scene.description}
          aria-invalid={hasError(errors, "description") || undefined}
          aria-describedby={`${descriptionId}-error`}
        />
        <FormError
          issues={errors}
          name="description"
          id={`${descriptionId}-error`}
        />
      </label>
      <div className="grid">
        <label htmlFor={orderId}>
          Ordre d'apparition
          <input
            id={orderId}
            aria-label="Ordre d'apparition de la scène"
            name="order_in_play"
            type="number"
            defaultValue={scene.order_in_play}
            required
            aria-invalid={hasError(errors, "order_in_play") || undefined}
            aria-describedby={`${orderId}-error`}
          />
          <FormError
            issues={errors}
            name="order_in_play"
            id={`${orderId}-error`}
          />
        </label>
        <label htmlFor={durationId}>
          Durée (secondes)
          <input
            id={durationId}
            aria-label="Durée estimée de la scène"
            name="duration_estimated_seconds"
            type="number"
            min={0}
            defaultValue={scene.duration_estimated_seconds}
            required
            aria-invalid={
              hasError(errors, "duration_estimated_seconds") || undefined
            }
            aria-describedby={`${durationId}-error`}
          />
          <FormError
            issues={errors}
            name="duration_estimated_seconds"
            id={`${durationId}-error`}
          />
        </label>
      </div>
      <label htmlFor={cutNotesId}>
        Notes de coupe (cut)
        <input
          id={cutNotesId}
          aria-label="Notes de coupe de la scène"
          name="cut_notes"
          defaultValue={scene.cut_notes}
          aria-invalid={hasError(errors, "cut_notes") || undefined}
          aria-describedby={`${cutNotesId}-error`}
        />
        <FormError
          issues={errors}
          name="cut_notes"
          id={`${cutNotesId}-error`}
        />
      </label>
      <fieldset>
        <legend>Rôles présents dans cette scène</legend>
        {roles.length === 0 ? (
          <p
            style={{
              color: "var(--pico-muted-color)",
              fontSize: "smaller",
            }}
          >
            Aucun rôle défini pour cette pièce.
          </p>
        ) : (
          roles.map((role) => (
            <label
              key={role.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <input
                type="checkbox"
                name="roleIds"
                value={Number(role.id)}
                defaultChecked={scene.roleIds.includes(Number(role.id))}
              />
              <span>{role.name}</span>
            </label>
          ))
        )}
      </fieldset>
      <label>
        <input
          aria-label="Scène active (incluse dans le montage)"
          name="is_active"
          type="checkbox"
          defaultChecked={scene.is_active}
        />
        Scène active (incluse dans le montage)
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
