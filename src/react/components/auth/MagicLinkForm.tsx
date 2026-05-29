/*
  Purpose:
  Magic Link login form - email input only.
*/

import { useState } from "react";
import { z } from "zod";
import { useAuth } from "./AuthContext";

const emailSchema = z.object({
  email: z.email(),
});

function MagicLinkForm() {
  const { sendMagicLink } = useAuth();
  const [sent, setSent] = useState(false);

  return sent ? (
    <p>
      ✉️ Un lien de connexion a été envoyé à votre adresse e-mail.
      <br />
      Consultez votre boîte de réception !
    </p>
  ) : (
    <form
      aria-label="Formulaire de connexion"
      action={(formData) => {
        const email = formData.get("email")?.toString();

        const parsed = emailSchema.safeParse({ email });

        if (!parsed.success) {
          alert(z.prettifyError(parsed.error));
          return;
        }

        sendMagicLink(parsed.data.email);
        setSent(true);
      }}
    >
      <hgroup>
        <h1>Connexion</h1>
        <p>Entrez votre adresse e-mail pour recevoir un lien de connexion.</p>
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
