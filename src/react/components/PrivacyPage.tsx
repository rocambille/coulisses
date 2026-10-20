/*
  Purpose:
  Privacy policy of the prototype (US-7.3, Q9).

  Design notes:
  - Public page: readable before logging in, linked from emails
  - States only what the application actually does (see ai/02 and ai/03)
  - To be reviewed by the project sponsor before opening to testers
*/

import { Link } from "react-router";

import { CONTACT_LABEL } from "../helpers/contact";

function PrivacyPage() {
  return (
    <article>
      <hgroup>
        <h1>Vos données et vos droits</h1>
        <p>Coulisses est un prototype, testé sur invitation.</p>
      </hgroup>

      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>
            <strong>Votre compte</strong> : votre email, votre nom (par défaut
            le début de votre email) et, si vous en ajoutez une, votre photo.
          </li>
        </ul>
        <p>
          Les seuls cookies utilisés sont nécessaires au fonctionnement : votre
          session de connexion et une protection contre les requêtes
          frauduleuses. Aucun outil de mesure d'audience ni aucun traceur
          publicitaire.
        </p>
      </section>

      <section>
        <h2>Pourquoi</h2>
        <p>
          Pour calculer les tendances partagées entre boutiques, et pour évaluer
          l'intérêt du concept pendant le test.
        </p>
      </section>

      <section>
        <h2>Qui voit quoi</h2>
        <ul>
          <li>Vous voyez vos propres données.</li>
          <li>
            Les administrateurs de vos troupes voient votre nom, votre email et
            les données de ces troupes.
          </li>
          <li>
            L'équipe qui développe le prototype peut accéder à la base de
            données pour son fonctionnement (corriger un doublon, extraire les
            indicateurs du test).
          </li>
        </ul>
      </section>

      <section>
        <h2>Combien de temps</h2>
        <p>
          Les données sont conservées pendant la durée du test. À la fin du
          test, elles sont supprimées, ou reprises dans le produit final
          uniquement avec l'accord des troupes.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <ul>
          <li>
            Corriger votre nom ou supprimer votre compte : depuis{" "}
            <Link to="/account">Mon compte</Link>. La suppression efface votre
            nom, votre email et votre photo.
          </li>
          <li>Pour toute autre demande : {CONTACT_LABEL}.</li>
        </ul>
      </section>
    </article>
  );
}

export default PrivacyPage;
