/*
  Purpose:
  Members management page for the Troupe Admin.
  Route: /troupes/:troupeId/members
*/

import { useId, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";

import { useMutate } from "../../helpers/mutate";
import { FormError, hasError } from "../FormError";
import Modal from "../ui/Modal";
import MemberRow from "./MemberRow";

const inviteSchema = z.object({
  email: z.email("L'email doit être une adresse email valide."),
  role: z.enum(["ACTOR", "ADMIN"], "Le rôle doit être acteur ou admin"),
});

export default function MembersPage() {
  const { troupeId } = useParams();
  const mutate = useMutate();
  const { members, isAdmin } = useOutletContext<{
    members: TroupeMember[];
    isAdmin: boolean;
  }>();
  const [isInviting, setIsInviting] = useState(false);
  const [errors, setErrors] = useState<ZodIssue[]>([]);

  const emailId = useId();
  const roleId = useId();

  const handleInvite = async (formData: FormData) => {
    const parsed = inviteSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      setErrors(parsed.error.issues);
      return;
    }

    setErrors([]);
    await mutate(`/api/troupes/${troupeId}/members`, "post", parsed.data, [
      `/api/troupes/${troupeId}/members`,
    ]);
    setIsInviting(false);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Membres de la troupe</h2>

        {isAdmin && (
          <button
            type="button"
            aria-label="Inviter un nouveau membre"
            onClick={() => {
              setErrors([]);
              setIsInviting(true);
            }}
            style={{ width: "auto" }}
          >
            ➕ Inviter un membre
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            {isAdmin && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </tbody>
      </table>

      {isInviting && (
        <Modal
          title="Inviter un nouveau membre"
          onClose={() => {
            setErrors([]);
            setIsInviting(false);
          }}
        >
          <form
            aria-label="Formulaire d'invitation d'un membre"
            action={handleInvite}
          >
            <label htmlFor={emailId}>
              Adresse email
              <input
                id={emailId}
                name="email"
                type="email"
                placeholder="son.adresse@mail.com"
                aria-label="Email"
                required
                aria-invalid={hasError(errors, "email") || undefined}
                aria-describedby={`${emailId}-error`}
              />
              <FormError issues={errors} name="email" id={`${emailId}-error`} />
            </label>
            <label htmlFor={roleId}>
              Rôle
              <select
                id={roleId}
                name="role"
                aria-label="Rôle"
                defaultValue="ACTOR"
                aria-invalid={hasError(errors, "role") || undefined}
                aria-describedby={`${roleId}-error`}
              >
                <option value="ACTOR">Acteur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
              <FormError issues={errors} name="role" id={`${roleId}-error`} />
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
                  setIsInviting(false);
                }}
              >
                Annuler
              </button>
              <button type="submit" style={{ width: "initial" }}>
                Inviter
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </>
  );
}
