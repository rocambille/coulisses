/*
  Purpose:
  Minimal form component responsible for updating user details.

  Design notes:
  - Use a native <form> to keep semantics explicit
  - Delegates all side effects to the useAuth hook

  Related docs:
  - https://react.dev/reference/react-dom/components/form
*/

import { useAuth } from "./AuthContext";

function AccountDetailsForm() {
  const { me, updateMe } = useAuth();

  return (
    <form
      action={(formData: FormData) => {
        const email = formData.get("email")?.toString();
        const name = formData.get("name")?.toString();

        if (email == null || name == null) {
          return;
        }

        updateMe({ email, name });
      }}
    >
      <fieldset>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={me?.email}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="name">Nom</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={me?.name}
        />
      </fieldset>

      <button type="submit">Enregistrer</button>
    </form>
  );
}

export default AccountDetailsForm;
