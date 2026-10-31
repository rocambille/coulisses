/*
  Purpose:
  Let admins send a push notification about a play, and tell them how many
  people it reached: an admin must not believe a reminder went out if nobody
  has notifications turned on.
*/

import { useState } from "react";
import { mutate } from "../../helpers/mutate";
import { isPushConfigured } from "../../helpers/push";

export default function NotifyButton({
  playId,
  kind,
  label,
}: {
  playId: string;
  kind: NotificationKind;
  label: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isPushConfigured()) {
    return null;
  }

  const handleClick = async () => {
    setIsPending(true);
    setFeedback(null);

    try {
      const response = await mutate(`/api/plays/${playId}/notify`, "post", {
        kind,
      });
      const { recipients }: { recipients: number } = await response.json();

      setFeedback(
        recipients > 0
          ? `Notification envoyée à ${recipients} ${recipients > 1 ? "personnes" : "personne"}.`
          : "Personne n'a été notifié : aucun membre concerné n'a activé les notifications.",
      );
    } catch {
      setFeedback("L'envoi a échoué. Vous pouvez réessayer.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <p>
      <button
        type="button"
        className="secondary outline"
        disabled={isPending}
        aria-busy={isPending}
        onClick={handleClick}
        style={{ width: "auto" }}
      >
        {label}
      </button>
      {feedback != null && (
        <>
          <br />
          <small role="status">{feedback}</small>
        </>
      )}
    </p>
  );
}
