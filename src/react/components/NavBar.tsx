/*
  Purpose:
  Define the main navigation bar of the application.

  This component:
  - Exposes the primary navigation links
  - Adapts links based on authentication state
  - Relies on React Router for active link handling
*/

import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { useAuth } from "./auth/AuthContext";

/*
  Helper to keep JSX concise and consistent.

  Using NavLink allows React Router to automatically
  apply active styles based on the current route.
*/
const link = (to: string, children: ReactNode) => (
  <li>
    <NavLink to={to}>{children}</NavLink>
  </li>
);

function NavBar() {
  const { check } = useAuth();

  return (
    <nav>
      <ul>
        {link("/", "🎭 Coulisses")}
        {check() ? link("/", "Mes Pièces") : link("/login", "Connexion")}
      </ul>
    </nav>
  );
}

export default NavBar;
