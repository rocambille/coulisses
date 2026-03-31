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
        const email = formData.get("email")?.toString() ?? "";

        if (email) {
          sendMagicLink(email);
          setSent(true);
        }
      }}
    >
      <hgroup>
        <h1>Connexion</h1>
        <p>Entre ton email pour recevoir un lien de connexion.</p>
      </hgroup>

      <input
        aria-label="Email"
        type="email"
        name="email"
        defaultValue=""
        placeholder="ton.adresse@mail.com"
        required
      />
      <button type="submit">Recevoir mon lien de connexion</button>
    </form>
  );
}

export default MagicLinkForm;
