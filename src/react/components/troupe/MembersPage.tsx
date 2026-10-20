/*
  Purpose:
  Members management page for the Troupe Admin.
  Route: /troupes/:troupeId/members
*/

import { useId, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";

import { mutate } from "../../helpers/mutate";
import { useMe } from "../auth/MeContext";
import { FormError, hasError } from "../FormError";
import Modal from "../ui/Modal";
import MemberRow from "./MemberRow";

const inviteSchema = z.object({
  email: z.email("L'email doit être une adresse email valide."),
  role: z.enum(["ACTOR", "ADMIN"], "Le rôle doit être acteur ou admin"),
});

export default function MembersPage() {
  const { user } = useMe();
  const navigate = useNavigate();
  const { troupeId } = useParams();
  const { members, isAdmin } = useOutletContext<{
    members: TroupeMember[];
    isAdmin: boolean;
  }>();
  const [isInviting, setIsInviting] = useState(false);
  const [errors, setErrors] = useState<ZodIssue[]>([]);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

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

  const handleLeaveTroupe = async () => {
    if (!user) return;
    if (!confirm("Êtes-vous sûr de vouloir quitter cette troupe ?")) {
      return;
    }
    setLeaveError(null);
    try {
      await mutate(
        `/api/troupes/${troupeId}/members/${user.id}`,
        "delete",
        null,
        ["/api/troupes", `/api/troupes/${troupeId}/members`],
      );
      navigate("/", { replace: true });
    } catch {
      setLeaveError(
        "Impossible de quitter la troupe. Vous devez laisser au moins un administrateur dans la troupe.",
      );
    }
  };

  const handleCopyInviteLink = async () => {
    try {
      const response = await fetch(`/api/troupes/${troupeId}/invite-link`);
      if (!response.ok) throw new Error();
      const data: { inviteUrl: string } = await response.json();
      await navigator.clipboard.writeText(data.inviteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      alert("Impossible de copier le lien d'invitation.");
    }
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

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
          {isAdmin && (
            <button
              type="button"
              className="secondary outline"
              aria-label="Copier le lien d'invitation"
              onClick={handleCopyInviteLink}
              style={{ width: "auto" }}
            >
              {linkCopied
                ? "✅ Lien copié !"
                : "🔗 Copier le lien d'invitation"}
            </button>
          )}
          <button
            type="button"
            className="contrast outline"
            aria-label="Quitter la troupe"
            onClick={handleLeaveTroupe}
            style={{ width: "auto" }}
          >
            Quitter la troupe
          </button>
        </div>
      </div>

      {leaveError && (
        <article
          style={{
            borderColor: "var(--pico-color-red-500)",
            color: "var(--pico-color-red-500)",
            marginBottom: "1rem",
          }}
        >
          {leaveError}
        </article>
      )}

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
