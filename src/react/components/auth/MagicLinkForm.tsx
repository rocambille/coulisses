/*
  Purpose:
  Magic Link login form — email input only.
  Replaces the old LoginRegisterForm (password-based).
*/

import { useState } from "react";
import { useAuth } from "./AuthContext";

function MagicLinkForm() {
  const { sendMagicLink } = useAuth();
  const [sent, setSent] = useState(false);

  return sent ? (
    <p>
      ✉️ Un lien de connexion a été envoyé à ton adresse email.
      <br />
      Consulte ta boîte de réception !
    </p>
  ) : (
    <form
      action={(formData) => {
        const email = formData.get("email")?.toString();

        if (email) {
          sendMagicLink(email);
          setSent(true);
        }
      }}
    >
      <input
        aria-label="Email"
        type="email"
        name="email"
        defaultValue=""
        placeholder="ton.email@exemple.com"
        required
      />
      <button type="submit">Recevoir mon lien de connexion</button>
    </form>
  );
}

export default MagicLinkForm;
