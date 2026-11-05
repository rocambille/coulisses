/*
  Purpose:
  Minimal form component responsible for updating user details.

  Design notes:
  - Use a native <form> to keep semantics explicit
  - Delegates all side effects to the useMe hook

  Related docs:
  - https://react.dev/reference/react-dom/components/form
*/

import { useId, useState } from "react";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";
import { FormError, hasError } from "../FormError";
import { useMe } from "./MeContext";

type AccountDetailsFormValues = Pick<User, "email" | "name">;

const AccountDetailsFormSchema: z.ZodType<AccountDetailsFormValues> = z.object({
  email: z.email("Email invalide"),
  name: z.string().min(1, "Nom requis"),
});

/*
  The email is how the account logs in: a new one only replaces the current
  one once confirmed with the code sent to it.
*/
function EmailConfirmationForm({
  email,
  onDone,
}: {
  email: string;
  onDone: () => void;
}) {
  const { confirmEmail } = useMe();
  const codeId = useId();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      aria-label="Formulaire de confirmation d'adresse"
      action={async (formData) => {
        setError(null);

        try {
          await confirmEmail(String(formData.get("code")));
          onDone();
        } catch (error) {
          setError(
            String(error).includes("409")
              ? "Cette adresse est déjà utilisée par un autre compte."
              : "Code invalide ou expiré.",
          );
        }
      }}
    >
      <p>
        Un code a été envoyé à <strong>{email}</strong>. Ton adresse actuelle
        reste utilisée tant que tu ne l'as pas saisi.
      </p>
      <label htmlFor={codeId}>Code de confirmation</label>
      <input
        id={codeId}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
        aria-invalid={error != null || undefined}
        aria-describedby={`${codeId}-error`}
      />
      {error != null && <small id={`${codeId}-error`}>{error}</small>}
      <button type="submit">Confirmer ma nouvelle adresse</button>
    </form>
  );
}

function AccountDetailsForm() {
  const { user, updateMe } = useMe();
  const emailId = useId();
  const nameId = useId();
  const [errors, setErrors] = useState<ZodIssue[]>([]);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  return (
    <>
      <form
        aria-label="account details form"
        action={async (formData: FormData) => {
          const parsed = AccountDetailsFormSchema.safeParse(
            Object.fromEntries(formData),
          );

          if (!parsed.success) {
            setErrors(parsed.error.issues);
            return;
          }

          setErrors([]);
          setHasFailed(false);

          try {
            setPendingEmail((await updateMe(parsed.data)).pendingEmail);
          } catch {
            setHasFailed(true);
          }
        }}
      >
        <fieldset>
          <label htmlFor={emailId}>Email</label>
          <input
            type="email"
            id={emailId}
            name="email"
            required
            defaultValue={user?.email}
            aria-invalid={hasError(errors, "email") || undefined}
            aria-describedby={`${emailId}-error`}
          />
          <FormError issues={errors} name="email" id={`${emailId}-error`} />
        </fieldset>
        <fieldset>
          <label htmlFor={nameId}>Nom</label>
          <input
            type="text"
            id={nameId}
            name="name"
            required
            defaultValue={user?.name}
            aria-invalid={hasError(errors, "name") || undefined}
            aria-describedby={`${nameId}-error`}
          />
          <FormError issues={errors} name="name" id={`${nameId}-error`} />
        </fieldset>

        <button type="submit">Enregistrer</button>
        {hasFailed && (
          <p role="alert">
            L'enregistrement a échoué. Si tu as demandé plusieurs codes, attends
            quelques minutes avant de réessayer.
          </p>
        )}
      </form>
      {pendingEmail != null && (
        <EmailConfirmationForm
          email={pendingEmail}
          onDone={() => setPendingEmail(null)}
        />
      )}
    </>
  );
}

export default AccountDetailsForm;
