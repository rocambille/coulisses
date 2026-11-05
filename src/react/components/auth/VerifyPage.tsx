/*
  Purpose:
  Verify a Magic Link token from the URL and establish the user session.

  Route: /verify?token=...
  - Reads the token from the query string
  - Calls verifyMagicLink from MeContext
  - Redirects to the `next` page on success (see authSchemas), or to the
    Dashboard
  - Shows an error message on failure
*/

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toSafeNextPath } from "../../../express/modules/auth/authSchemas";
import { useMe } from "./MeContext";

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const { verifyMagicLink } = useMe();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const token = searchParams.get("token");
  // Checked again here: the link of an email can be edited before opening it
  const next = toSafeNextPath(searchParams.get("next")) ?? "/";

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError(true);
        return;
      }

      try {
        await verifyMagicLink(token);
        navigate(next, { replace: true });
      } catch {
        setError(true);
      }
    };
    verify();
  }, [token, next, verifyMagicLink, navigate]);

  if (error) {
    return (
      <article>
        <header>Lien invalide ou expiré</header>
        <p>
          Ce lien de connexion n'est plus valide. Il a peut-être expiré ou a
          déjà été utilisé.
        </p>
        <Link to="/">Demander un nouveau lien</Link>
      </article>
    );
  }

  return <p aria-busy="true">Verification en cours...</p>;
}

export default VerifyPage;
