/*
  Purpose:
  Act as the authentication switch for the UI.

  This component:
  - Reads authentication state from AuthContext
  - Chooses which form to render based on that state
  - Contains no business logic and no side effects
*/

import { useAuth } from "./AuthContext";
import LogoutForm from "./LogoutForm";
import MagicLinkForm from "./MagicLinkForm";

function AuthForm() {
  const auth = useAuth();

  return auth.check() ? <LogoutForm /> : <MagicLinkForm />;
}

export default AuthForm;
