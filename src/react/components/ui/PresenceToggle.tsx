import React from "react";
import { useMutate } from "../../helpers/mutate";

type PresenceStatus = "PRESENT" | "ABSENT" | "PENDING";

interface PresenceToggleProps {
  eventId: number;
  initialStatus: PresenceStatus;
}

export default function PresenceToggle({
  eventId,
  initialStatus,
}: PresenceToggleProps) {
  const [status, setStatus] = React.useState<PresenceStatus>(initialStatus);
  const mutate = useMutate();
  const [isPending, setIsPending] = React.useState(false);

  const toggle = async () => {
    if (isPending) return;

    // Cycle: PENDING -> PRESENT -> ABSENT -> PRESENT
    const newStatus: PresenceStatus =
      status === "PRESENT" ? "ABSENT" : "PRESENT";

    // Optimistic UI
    const prevStatus = status;
    setStatus(newStatus);
    setIsPending(true);

    try {
      await mutate(`/api/events/${eventId}/presence`, "post", {
        status: newStatus,
      });
    } catch (err) {
      console.error(err);
      setStatus(prevStatus); // revert on failure
    } finally {
      setIsPending(false);
    }
  };

  const colors: Record<PresenceStatus, string> = {
    PRESENT: "var(--pico-color-emerald-500)",
    ABSENT: "var(--pico-color-red-500)",
    PENDING: "var(--pico-color-slate-400)",
  };

  const labels: Record<PresenceStatus, string> = {
    PRESENT: "Présent",
    ABSENT: "Absent",
    PENDING: "À Confirmer",
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={status === "PENDING" ? "secondary" : "outline"}
      style={{
        padding: "0.2rem 0.5rem",
        fontSize: "0.8rem",
        width: "auto",
        marginBottom: 0,
        borderColor: colors[status],
        color: status !== "PENDING" ? colors[status] : undefined,
      }}
    >
      {labels[status]}
    </button>
  );
}
