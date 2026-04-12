import { useId } from "react";
import { useAction } from "./hooks";

function PreferenceSelector({
  sceneId,
  playId,
  currentLevel,
}: {
  sceneId: number;
  playId: string;
  currentLevel?: string;
}) {
  const selectId = useId();
  const runAction = useAction();

  const handleChange = async (level: string) => {
    await runAction(`/api/scenes/${sceneId}/preferences`, "put", { level }, [
      `/api/plays/${playId}/preferences`,
    ]);
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <label htmlFor={selectId} style={{ margin: 0, fontSize: "0.8rem" }}>
        Ton envie :
      </label>
      <select
        id={selectId}
        aria-label={`Niveau d'envie pour la scène ${sceneId}`}
        value={currentLevel ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        style={{
          margin: 0,
          padding: "0.1rem 0.5rem",
          height: "auto",
          width: "auto",
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
