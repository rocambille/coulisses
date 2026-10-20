/*
  Purpose:
  Remind testers that they use a prototype (US-7.3).
*/

import { Link } from "react-router";

function PrototypeBanner() {
  return (
    <p
      role="note"
      style={{
        margin: 0,
        paddingBlock: "0.25rem",
        textAlign: "center",
        fontSize: "0.875em",
        background: "var(--pico-muted-border-color)",
      }}
    >
      Prototype - version de test.{" "}
      <Link to="/privacy">Vos données et vos droits</Link>
    </p>
  );
}

export default PrototypeBanner;
