/*
  Purpose:
  Landing page for troupe invitation links.
  Route: /troupes/:troupeId/join?token=...

  Behavior:
  - Fetches troupe info from the public GET /api/troupes/:troupeId/join endpoint
  - If unauthenticated: shows troupe info + login form, which brings the
    user back here once logged in (by code, or by the link of the email)
  - If authenticated: shows troupe info + "Rejoindre" button
  - After join: redirects to the troupe dashboard
*/

import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

import { mutate } from "../../helpers/mutate";
import MagicLinkForm from "../auth/MagicLinkForm";
import { useMe } from "../auth/MeContext";

type TroupeJoinInfo = {
  id: number;
  name: string;
  description: string;
};

export default function JoinPage() {
  const { troupeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useMe();

  const token = searchParams.get("token");

  const [troupeInfo, setTroupeInfo] = useState<TroupeJoinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Fetch troupe info on mount (public endpoint, no auth needed)
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await fetch(
          `/api/troupes/${troupeId}/join?token=${token}`,
        );
        if (!response.ok) {
          setError("Ce lien d'invitation n'est pas valide ou a expiré.");
          return;
        }
        const data: TroupeJoinInfo = await response.json();
        setTroupeInfo(data);
      } catch {
        setError("Impossible de charger les informations de la troupe.");
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setError("Lien d'invitation invalide : jeton manquant.");
      setLoading(false);
      return;
    }

    fetchInfo();
  }, [troupeId, token]);

  const handleJoin = async () => {
    if (!token) return;
    setJoining(true);
    setError(null);
    try {
      await mutate(`/api/troupes/${troupeId}/join`, "post", { token }, [
        "/api/troupes",
      ]);
      navigate(`/troupes/${troupeId}`, { replace: true });
    } catch {
      setError("Impossible de rejoindre la troupe. Veuillez réessayer.");
      setJoining(false);
    }
  };

  if (loading) {
    return <p aria-busy="true">Chargement...</p>;
  }

  if (error && !troupeInfo) {
    return (
      <article>
        <header>Invitation invalide</header>
        <p>{error}</p>
      </article>
    );
  }

  if (!troupeInfo) return null;

  return (
    <article>
      <header>
        <h2 style={{ margin: 0 }}>Vous êtes invité à rejoindre une troupe</h2>
      </header>

      <hgroup>
        <h3>🎭 {troupeInfo.name}</h3>
        {troupeInfo.description && <p>{troupeInfo.description}</p>}
      </hgroup>

      {error && (
        <p
          style={{
            color: "var(--pico-color-red-500)",
            marginBottom: "1rem",
          }}
        >
          {error}
        </p>
      )}

      {isAuthenticated ? (
        <footer>
          <p>
            Connecté en tant que <strong>{user?.name || user?.email}</strong>.
          </p>
          <button
            type="button"
            onClick={handleJoin}
            aria-busy={joining || undefined}
            disabled={joining}
          >
            {joining ? "Inscription en cours..." : "Rejoindre la troupe"}
          </button>
        </footer>
      ) : (
        <footer>
          <p>Connectez-vous pour rejoindre cette troupe :</p>
          <MagicLinkForm next={`${location.pathname}${location.search}`} />
        </footer>
      )}
    </article>
  );
}
