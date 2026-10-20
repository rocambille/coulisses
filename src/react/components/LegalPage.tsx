/*
  Purpose:
  Legal notice of the prototype (US-7.3): who publishes it, who hosts it.

  Design notes:
  - Public page
  - Publisher and host identities are not known yet: the placeholders
    must be completed before opening to testers (batch L8)
*/

import { CONTACT_LABEL } from "../helpers/contact";

function LegalPage() {
  return (
    <article>
      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur</h2>
        <p>
          Code Collectif
          <br />
          RNA : W513010129
          <br />
          SIRET : 92415889200019
          <br />
          Siège social : 59 rue de Strasbourg, 51100 REIMS <br />
          Contact : {CONTACT_LABEL}
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Site hébergé sur un{" "}
          <a href="https://www.ikoula.com/fr/vps/linux?utm_source=codecollectif&utm_medium=banner&utm_campaign=iksvp">
            VPS
          </a>{" "}
          IKOULA
        </p>
        <a
          href="https://www.ikoula.com/fr?utm_source=codecollectif&utm_medium=banner&utm_campaign=iksvp"
          title="Hébergement web, serveurs dédiés et solutions sur mesure"
        >
          <img
            title="Hébergement web, serveurs dédiés et solutions sur mesure"
            alt="Hébergé par Ikoula"
            src="https://www.ikoula.com/sites/default/files/2025-01/heberge_par_ikoula_light.png"
            width="204"
            height="79"
          />
        </a>
      </section>

      <section>
        <h2>Statut</h2>
        <p>
          Coulisses est un prototype destiné à présenter et valider un concept
          auprès de troupes de théâtre invitées. Il ne s'agit pas d'un produit
          commercial.
        </p>
      </section>
    </article>
  );
}

export default LegalPage;
