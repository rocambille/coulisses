import { use } from "react";
import { cache } from "../../helpers/cache";
import { useAuth } from "../auth/AuthContext";

export function useMembership(playId: string | undefined) {
  const { me } = useAuth();

  // If no playId, we can't be a member
  if (!playId) {
    throw new Error("No playId provided");
  }

  const members: (User & { role: string })[] = use(
    cache(`/api/plays/${playId}/members`),
  );

  const member = members.find((m) => m.id === me?.id);
  const isTeacher = member?.role === "TEACHER";
  const isActor = member?.role === "ACTOR";

  return {
    member,
    isTeacher,
    isActor,
    members,
  };
}
