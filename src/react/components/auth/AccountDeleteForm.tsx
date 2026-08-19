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
          Tu pourras demander à un admin de le restaurer plus tard. Tu peux
          demander une suppression définitive si tu le souhaites. Dans tous les
          cas, la suppression de ton compte sera effective et tu ne pourras plus
          te connecter.
        </p>
      </hgroup>

      <button className="contrast" type="submit">
        Supprimer mon compte
      </button>
    </form>
  );
}

export default AccountDeleteForm;
