/*
  Purpose:
  Footer of every page: privacy policy, legal notice and feedback
  (US-7.3, US-7.4).

  Design notes:
  - Feedback is a mailto: link with the current page in the subject,
    the simplest channel for a prototype (no data sent to a third party)
*/

import { Link, useLocation } from "react-router";

import { CONTACT_EMAIL } from "../../helpers/contact";

function SiteFooter() {
  const location = useLocation();

  const feedback =
    CONTACT_EMAIL &&
    `mailto:${CONTACT_EMAIL}?${new URLSearchParams({
      subject: `Ludo Pulse - mon avis sur la page ${location.pathname}`,
    })
      .toString()
      .replaceAll("+", "%20")}`;

  return (
    <footer className="container">
      <small>
        <Link to="/privacy">Confidentialité</Link> ·{" "}
        <Link to="/legal">Mentions légales</Link>
        {feedback && (
          <>
            {" "}
            · <a href={feedback}>Votre avis sur l'outil</a>
          </>
        )}
      </small>
    </footer>
  );
}

export default SiteFooter;
