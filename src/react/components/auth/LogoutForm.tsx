/*
  Purpose:
  Minimal form component responsible for triggering logout.

  Design notes:
  - Use a native <form> to keep semantics explicit
  - Delegates all side effects to the useAuth hook

  Related docs:
  - https://react.dev/reference/react-dom/components/form
*/

import { useAuth } from "./AuthContext";

function LogoutForm() {
  const { logout } = useAuth();

  return (
    <form action={logout}>
      <hgroup>
        <h1>Déconnexion</h1>
        <p>Tu vas être déconnecté de ton compte.</p>
      </hgroup>

      <button type="submit">Se déconnecter</button>
    </form>
  );
}

export default LogoutForm;
