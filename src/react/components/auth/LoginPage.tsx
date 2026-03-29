/*
  Purpose:
  Public login page — displays the Magic Link form.
  Route: /login
*/

import MagicLinkForm from "./MagicLinkForm";

function LoginPage() {
  return (
    <>
      <hgroup>
        <h1>Connexion</h1>
        <p>Entre ton email pour recevoir un lien de connexion.</p>
      </hgroup>

      <MagicLinkForm />
    </>
  );
}

export default LoginPage;
