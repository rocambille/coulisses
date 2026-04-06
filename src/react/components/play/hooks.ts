import { use } from "react";
import { useAuth } from "../auth/AuthContext";
import { useRefresh } from "../RefreshContext";
import { cache, invalidateCache, mutate } from "../utils";

export function useAction() {
  const { refresh } = useRefresh();

  return async (
    url: string,
    method: "post" | "put" | "delete",
    body?: unknown,
    invalidatePaths: string[] = [],
  ) => {
    const response = await mutate(url, method, body);

    if (response.ok) {
      for (const path of invalidatePaths) {
        invalidateCache(path);
      }
      refresh();
    }

    return response;
  };
}

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
