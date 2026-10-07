/*
  Purpose:
  Define the main navigation bar of the application.

  This component:
  - Exposes the primary navigation links
  - Relies on React Router for active link handling

  Design notes:
  - No business logic
  - Purely declarative navigation
*/

import type { ReactNode } from "react";
import { NavLink } from "react-router";

import Avatar from "./auth/Avatar";
import { useMe } from "./auth/MeContext";
import Logo from "./ui/Logo";

/*
  Helper to keep JSX concise and consistent.

  Using NavLink allows React Router to automatically
  apply active styles based on the current route.
*/
const link = (to: string, children: ReactNode) => (
  <li style={{ display: "flex" }}>
    <NavLink to={to}>{children}</NavLink>
  </li>
);

function NavBar() {
  const { user, isAuthenticated } = useMe();

  return (
    <nav>
      <ul>
        {link(
          "/",
          <span>
            <Logo compact size="1.2rlh" />
          </span>,
        )}
        {isAuthenticated && (
          <>
            {link("/account", "Mon compte")}
            {link(
              "/account",
              <Avatar url={user?.avatar_url} name={user?.name} size="1.2rlh" />,
            )}
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
