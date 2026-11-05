/*
  Purpose:
  Minimal form component responsible for triggering logout.

  Design notes:
  - Use a native <form> to keep semantics explicit
  - Delegates all side effects to the useMe hook

  Related docs:
  - https://react.dev/reference/react-dom/components/form
*/

import { useMe } from "./MeContext";

function LogoutForm() {
  const { logout, logoutEverywhere } = useMe();

  return (
    <form action={logout}>
      <hgroup>
        <h2>Déconnexion</h2>
        <p>
          Tu vas être déconnecté de ton compte sur cet appareil. Si tu penses
          qu'une session est restée ouverte ailleurs, déconnecte-toi de tous tes
          appareils.
        </p>
      </hgroup>
      <button className="secondary" type="submit">
        Se déconnecter
      </button>{" "}
      <button
        className="secondary outline"
        type="submit"
        formAction={logoutEverywhere}
      >
        Se déconnecter de tous les appareils
      </button>
    </form>
  );
}

export default LogoutForm;
