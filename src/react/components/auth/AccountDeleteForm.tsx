/*
  Purpose:
  Minimal form component responsible for triggering account deletion.

  Design notes:
  - Use a native <form> to keep semantics explicit
  - Delegates all side effects to the useMe hook

  Related docs:
  - https://react.dev/reference/react-dom/components/form
*/

import { useMe } from "./MeContext";

function AccountDeleteForm() {
  const { deleteMe } = useMe();

  return (
    <form
      action={() => {
        if (confirm("Es-tu sûr de vouloir supprimer ton compte ?")) {
          deleteMe();
        }
      }}
    >
      <hgroup>
        <h2>Suppression du compte</h2>
        <p>
          Ton nom, ton email et ta photo seront définitivement effacés. Tes
          votes et ta place dans la distribution restent dans tes troupes, sans
          ton nom. Tu pourras créer un nouveau compte avec le même email, mais
          sans retrouver celui-ci.
        </p>
      </hgroup>

      <button className="contrast" type="submit">
        Supprimer mon compte
      </button>
    </form>
  );
}

export default AccountDeleteForm;
