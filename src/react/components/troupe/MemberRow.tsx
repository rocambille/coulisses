/*
  Purpose:
  Members management page for the Troupe Admin.
  Route: /troupes/:troupeId/members
*/

import { useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { useMutate } from "../../helpers/mutate";

interface MemberRowProps {
  member: TroupeMember;
}

export default function MemberRow({ member }: MemberRowProps) {
  const { troupeId } = useParams();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();
  const mutate = useMutate();

  const [role, setRole] = useState<TroupeMember["role"]>(member.role);

  const handleUpdate: React.ChangeEventHandler<HTMLSelectElement> = async (
    event,
  ) => {
    if (!confirm("Changer le rôle de ce membre ?")) return;

    const newRole = event.target.value;

    const response = await mutate(
      `/api/troupes/${troupeId}/members/${member.id}`,
      "put",
      { email: member.email, name: member.name, role: newRole },
      [`/api/troupes/${troupeId}/members`],
    );

    if (response.ok) {
      setRole(newRole as TroupeMember["role"]);
    } else {
      response.json().then((data) => alert(data.error));
    }
  };

  const handleRemove = async () => {
    if (!confirm("Retirer ce membre de la troupe ?")) return;
    const response = await mutate(
      `/api/troupes/${troupeId}/members/${member.id}`,
      "delete",
      null,
      [`/api/troupes/${troupeId}/members`],
    );

    if (!response.ok) {
      response.json().then((data) => alert(data.error));
    }
  };

  return (
    <tr key={member.id}>
      <td>{member.name}</td>
      <td>{member.email}</td>
      {isAdmin ? (
        <>
          <td>
            <select
              style={{
                fontSize: "smaller",
                margin: 0,
              }}
              name="role"
              aria-label="Rôle"
              value={role}
              onChange={handleUpdate}
            >
              <option value="ACTOR">Acteur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </td>
          <td>
            <button
              aria-label={`retirer ${member.id}`}
              type="button"
              onClick={handleRemove}
              className="outline contrast"
              style={{
                fontSize: "smaller",
                margin: 0,
              }}
            >
              Retirer
            </button>
          </td>
        </>
      ) : (
        <td>{member.role === "ADMIN" ? "Admin" : "Acteur"}</td>
      )}
    </tr>
  );
}
