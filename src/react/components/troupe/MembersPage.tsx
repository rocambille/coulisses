/*
  Purpose:
  Members management page for the Troupe Admin.
  Route: /troupes/:troupeId/members
*/

import { useOutletContext, useParams } from "react-router";
import z from "zod";
import { useMutate } from "../../helpers/mutate";
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

  const handleInvite = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const role = formData.get("role")?.toString();

    const parsed = inviteSchema.safeParse({ email, role });

    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return;
    }

    await mutate(`/api/troupes/${troupeId}/members`, "post", parsed.data, [
      `/api/troupes/${troupeId}/members`,
    ]);
  };

  return (
    <>
      <h2>Membres de la troupe</h2>

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

      {isAdmin && (
        <details>
          <summary>Inviter un nouveau membre</summary>
          <form aria-label="invite form" action={handleInvite}>
            <input
              name="email"
              type="email"
              placeholder="son.adresse@mail.com"
              aria-label="Email"
              required
            />
            <select name="role" aria-label="Rôle" defaultValue="ACTOR">
              <option value="ACTOR">Acteur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
            <button type="submit">Inviter</button>
          </form>
        </details>
      )}
    </>
  );
}
