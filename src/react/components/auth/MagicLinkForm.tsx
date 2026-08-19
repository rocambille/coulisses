/*
  Purpose:
  Magic Link login form - email input only.
*/

import { useId, useState } from "react";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";
import { FormError, hasError } from "../FormError";
import { useMe } from "./MeContext";

type MagicLinkFormValues = Pick<User, "email">;

const MagicLinkFormSchema: z.ZodType<MagicLinkFormValues> = z.object({
  email: z.email(),
});

function MagicLinkForm() {
  const { sendMagicLink } = useMe();
  const [sent, setSent] = useState(false);
  const emailId = useId();
  const [errors, setErrors] = useState<ZodIssue[]>([]);

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
        const parsed = MagicLinkFormSchema.safeParse(
          Object.fromEntries(formData.entries()),
        );

        if (!parsed.success) {
          setErrors(parsed.error.issues);
          return;
        }

        setErrors([]);
        sendMagicLink(parsed.data.email);
        setSent(true);
      }}
    >
      <hgroup>
        <h1>Connexion</h1>
        <p>Entrez votre adresse e-mail pour recevoir un lien de connexion.</p>
      </hgroup>

      <input
        id={emailId}
        aria-label="Email"
        type="email"
        name="email"
        defaultValue=""
        placeholder="ton.adresse@mail.com"
        required
        aria-invalid={hasError(errors, "email") || undefined}
        aria-describedby={`${emailId}-error`}
      />
      <FormError issues={errors} name="email" id={`${emailId}-error`} />
      <button type="submit">Recevoir mon lien de connexion</button>
    </form>
  );
}

export default MagicLinkForm;
