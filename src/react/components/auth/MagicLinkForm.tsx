/*
  Purpose:
  Login form: asks for an email, then accepts the code that email contains.

  Design notes:
  - The email also has a link (see VerifyPage). The code is what works when
    the link opens elsewhere: another device, or Safari instead of the app
    installed on an iPhone
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

function CodeForm({
  email,
  onRestart,
}: {
  email: string;
  onRestart: () => void;
}) {
  const { verifyCode } = useMe();
  const codeId = useId();
  const [hasFailed, setHasFailed] = useState(false);

  return (
    <form
      aria-label="Formulaire de code de connexion"
      action={async (formData) => {
        setHasFailed(false);

        try {
          await verifyCode(email, String(formData.get("code")));
        } catch {
          setHasFailed(true);
        }
      }}
    >
      <p>
        ✉️ Un e-mail de connexion a été envoyé à <strong>{email}</strong>.
        <br />
        Ouvrez son lien, ou saisissez ici le code qu'il contient.
      </p>

      <label htmlFor={codeId}>Code de connexion</label>
      <input
        id={codeId}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
        aria-invalid={hasFailed || undefined}
        aria-describedby={`${codeId}-error`}
      />
      {hasFailed && (
        <small id={`${codeId}-error`}>
          Code invalide ou expiré. Vérifiez-le, ou demandez un nouvel e-mail.
        </small>
      )}

      <button type="submit">Se connecter</button>
      <button type="button" className="secondary outline" onClick={onRestart}>
        Changer d'adresse ou recevoir un nouvel e-mail
      </button>
    </form>
  );
}

/*
  next: the page to come back to after logging in. The code keeps the user
  on the current page anyway; the link of the email needs to be told.
*/
function MagicLinkForm({ next }: { next?: string }) {
  const { sendMagicLink } = useMe();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const emailId = useId();
  const [errors, setErrors] = useState<ZodIssue[]>([]);

  return sentTo != null ? (
    <CodeForm email={sentTo} onRestart={() => setSentTo(null)} />
  ) : (
    <form
      aria-label="Formulaire de connexion"
      action={(formData) => {
        const parsed = MagicLinkFormSchema.safeParse(
          Object.fromEntries(formData),
        );

        if (!parsed.success) {
          setErrors(parsed.error.issues);
          return;
        }

        setErrors([]);
        sendMagicLink(parsed.data.email, next);
        setSentTo(parsed.data.email);
      }}
    >
      <hgroup>
        <h1>Connexion</h1>
        <p>
          Entrez votre adresse e-mail pour recevoir un lien et un code de
          connexion.
        </p>
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
      <button type="submit">Recevoir mon e-mail de connexion</button>
    </form>
  );
}

export default MagicLinkForm;
