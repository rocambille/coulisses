/*
  Purpose:
  Let users turn push notifications on or off for the current device.

  Design notes:
  - The state is only known in the browser, so nothing renders during SSR
  - Hidden where push cannot work, except on iOS where a hint explains how
*/

import { useEffect, useState } from "react";
import {
  disablePush,
  enablePush,
  isPushEnabled,
  isPushSupported,
  needsHomeScreenInstall,
} from "../../helpers/push";

type Status = "unknown" | "unavailable" | "install" | "denied" | "off" | "on";

function NotificationToggle() {
  const [status, setStatus] = useState<Status>("unknown");
  const [isPending, setIsPending] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (needsHomeScreenInstall()) {
      setStatus("install");
    } else if (!isPushSupported()) {
      setStatus("unavailable");
    } else if (Notification.permission === "denied") {
      setStatus("denied");
    } else {
      isPushEnabled().then((isEnabled) => setStatus(isEnabled ? "on" : "off"));
    }
  }, []);

  if (status === "unknown" || status === "unavailable") {
    return null;
  }

  const handleChange = async (enable: boolean) => {
    setIsPending(true);
    setHasFailed(false);

    try {
      if (!enable) {
        await disablePush();
        setStatus("off");
      } else if (await enablePush()) {
        setStatus("on");
      } else if (Notification.permission === "denied") {
        setStatus("denied");
      }
    } catch {
      setHasFailed(true);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section>
      <h2>Notifications</h2>
      {status === "install" && (
        <p>
          Pour recevoir les notifications sur ton iPhone ou ton iPad, ajoute
          d'abord Coulisses à ton écran d'accueil depuis le menu Partager de
          Safari, puis ouvre l'application.
        </p>
      )}
      {status === "denied" && (
        <p>
          Les notifications sont bloquées pour Coulisses. Tu peux les autoriser
          dans les réglages de ton navigateur.
        </p>
      )}
      {(status === "on" || status === "off") && (
        <label>
          <input
            type="checkbox"
            role="switch"
            checked={status === "on"}
            aria-checked={status === "on"}
            disabled={isPending}
            onChange={(event) => handleChange(event.target.checked)}
          />
          Recevoir les notifications sur cet appareil
        </label>
      )}
      {hasFailed && (
        <p role="alert">
          Le changement n'a pas pu être enregistré. Tu peux réessayer.
        </p>
      )}
    </section>
  );
}

export default NotificationToggle;
