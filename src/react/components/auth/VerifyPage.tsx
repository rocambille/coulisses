/*
  Purpose:
  Verify a Magic Link token from the URL and establish the user session.

  Route: /verify?token=...
  - Reads the token from the query string
  - Calls verifyMagicLink from AuthContext
  - Redirects to Dashboard on success
  - Shows an error message on failure
*/

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "./AuthContext";

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const { verifyMagicLink } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError(true);
      return;
    }

    verifyMagicLink(token)
      .then(() => {
        navigate("/", { replace: true });
      })
      .catch(() => {
        setError(true);
      });
  }, [token, verifyMagicLink, navigate]);

  if (error) {
    return (
      <article>
        <header>Lien invalide ou expiré</header>
        <p>
          Ce lien de connexion n'est plus valide. Il a peut-être expiré ou a
          déjà été utilisé.
        </p>
        <Link to="/login">Demander un nouveau lien</Link>
      </article>
    );
  }

  return <p aria-busy="true">Vérification en cours...</p>;
}

export default VerifyPage;
