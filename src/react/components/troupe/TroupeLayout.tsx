import { use, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router";
import { getOrFetch } from "../../helpers/cache";
import { useMe } from "../auth/MeContext";
import { useRefresh } from "../DataRefreshContext";

export default function TroupeLayout() {
  const { troupeId } = useParams();
  const { user } = useMe();
  useRefresh(); // Subscribes this component to re-renders when tick changes

  const [moreBreadcrumb, pushBreadcrumb] = useState<NavItem[]>([]);

  const troupe: Troupe = use(getOrFetch<Troupe>(`/api/troupes/${troupeId}`));
  const members: TroupeMember[] = use(
    getOrFetch<TroupeMember[]>(`/api/troupes/${troupeId}/members`),
  );
  const preferences = use<{
    playPreferences: PlayPreference[];
    scenePreferences: ScenePreference[];
    rolePreferences: RolePreference[];
  }>(getOrFetch("/api/preferences/me"));

  const myMemberInfo = members.find((m) => m.id === user?.id);
  const isAdmin = myMemberInfo?.role === "ADMIN";

  return (
    <>
      <nav aria-label="breadcrumb">
        <ul>
          <li>
            <NavLink to={`/`}>Mes troupes</NavLink>
          </li>
          <li>
            <NavLink to={`/troupes/${troupeId}`} end>
              {troupe.name}
            </NavLink>
          </li>
          {moreBreadcrumb.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Outlet
        context={{ troupe, members, isAdmin, pushBreadcrumb, ...preferences }}
      />
    </>
  );
}
