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
      ✉️ A login link has been sent to your email address.
      <br />
      Check your inbox!
    </p>
  ) : (
    <form
      aria-label="login form"
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
        <h1>Login</h1>
        <p>Enter your email to receive a login link.</p>
      </hgroup>

      <input
        aria-label="Email"
        type="email"
        name="email"
        defaultValue=""
        placeholder="your.address@mail.com"
        required
      />
      <button type="submit">Receive my login link</button>
    </form>
  );
}

export default MagicLinkForm;
