import { useId, useState } from "react";
import { useMutate } from "../../helpers/mutate";

function PreferenceSelector({
  sceneId,
  roleId,
  playId,
  currentLevel,
}: {
  sceneId?: number;
  roleId?: number;
  playId: string;
  currentLevel?: string;
}) {
  const selectId = useId();
  const mutate = useMutate();
  const [isPending, setIsPending] = useState(false);

  const handleChange = async (level: string) => {
    if (!level) return;
    setIsPending(true);
    try {
      if (roleId && sceneId) {
        await mutate(
          `/api/scenes/${sceneId}/roles/${roleId}/preferences`,
          "post",
          { level },
          ["/api/preferences/me", `/api/plays/${playId}/casting/dashboard`],
        );
      } else if (sceneId) {
        await mutate(`/api/scenes/${sceneId}/preferences`, "post", { level }, [
          "/api/preferences/me",
          `/api/plays/${playId}/casting/dashboard`,
        ]);
      } else {
        await mutate(`/api/plays/${playId}/preferences`, "post", { level }, [
          "/api/preferences/me",
          `/api/plays/${playId}/casting/dashboard`,
        ]);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <label
        htmlFor={selectId}
        style={{
          margin: 0,
          fontSize: "0.8rem",
          color: "var(--pico-muted-color)",
        }}
      >
        Envie:
      </label>
      <select
        id={selectId}
        aria-label={
          roleId
            ? `Niveau d'envie pour le rôle ${roleId}`
            : sceneId
              ? `Niveau d'envie pour la scène ${sceneId}`
              : `Niveau d'envie pour la pièce ${playId}`
        }
        value={currentLevel ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        style={{
          margin: 0,
          padding: "0.1rem 0.5rem",
          height: "auto",
          width: "auto",
          fontSize: "0.8rem",
        }}
      >
        <option value="">— Choisis —</option>
        <option value="HIGH">🔥 Très envie</option>
        <option value="MEDIUM">👍 Pourquoi pas</option>
        <option value="LOW">🤏 Pas trop</option>
        <option value="NOT_INTERESTED">❌ Pas du tout</option>
      </select>
    </div>
  );
}

export default PreferenceSelector;
