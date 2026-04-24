/*
  Purpose:
  Members management page for the teacher.
  Route: /plays/:playId/members
*/

import { use } from "react";
import { useParams } from "react-router";
import { cache } from "../../helpers/cache";
import { useMutate } from "../../helpers/mutate";
import { useMembership } from "./hooks";

type Member = User & { role: string };

function MembersPage() {
  const { playId } = useParams();
  const mutate = useMutate();
  const { isTeacher } = useMembership(playId);
  const members: Member[] = use(cache(`/api/plays/${playId}/members`));

  const handleInvite = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const role = formData.get("role")?.toString();

    if (!email || !role) throw new Error("Invalid form submission");

    await mutate(
      `/api/plays/${playId}/members`,
      "post",
      {
        email,
        role,
      },
      [`/api/plays/${playId}/members`],
    );
  };

  return (
    <>
      <h2>Membres</h2>

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.role === "TEACHER" ? "Professeur" : "Comédien"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isTeacher && (
        <details>
          <summary>Inviter un membre</summary>
          <form action={handleInvite}>
            <input
              name="email"
              type="email"
              placeholder="son.adresse@mail.com"
              aria-label="Email"
              required
            />
            <select name="role" aria-label="Rôle" defaultValue="ACTOR">
              <option value="ACTOR">Comédien</option>
              <option value="TEACHER">Professeur</option>
            </select>
            <button type="submit">Inviter</button>
          </form>
        </details>
      )}
    </>
  );
}

export default MembersPage;
