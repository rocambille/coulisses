import { use, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router";
import { cache } from "../../helpers/cache";
import { useAuth } from "../auth/AuthContext";
import { useRefresh } from "../DataRefreshContext";

export default function TroupeLayout() {
  const { troupeId } = useParams();
  const { me } = useAuth();
  useRefresh(); // Subscribes this component to re-renders when tick changes

  const [moreBreadcrumb, pushBreadcrumb] = useState<NavItem[]>([]);

  const troupe: Troupe = use(cache(`/api/troupes/${troupeId}`));
  const members: TroupeMember[] = use(
    cache(`/api/troupes/${troupeId}/members`),
  );
  const preferences = use<{
    playPreferences: PlayPreference[];
    scenePreferences: ScenePreference[];
    rolePreferences: RolePreference[];
  }>(cache("/api/preferences/me"));

  const myMemberInfo = members.find((m) => m.id === me?.id);
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
