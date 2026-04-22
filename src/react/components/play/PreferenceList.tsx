/*
  Purpose:
  Displays a list of preferences for a scene from different troupe members.
*/

function PreferenceList({
  sceneId,
  preferences,
}: {
  sceneId: Scene["id"];
  preferences: PreferenceWithUser[];
}) {
  const scenePreferences = preferences.filter((p) => p.scene_id === sceneId);

  const getEmoji = (level: string) => {
    switch (level) {
      case "HIGH":
        return "🔥";
      case "MEDIUM":
        return "👍";
      case "LOW":
        return "🤏";
      case "NOT_INTERESTED":
        return "❌";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginTop: "0.5rem",
      }}
    >
      {scenePreferences.map((preference) => {
        return (
          <span
            key={`${preference.user_id}-${preference.scene_id}`}
            title={`${preference.name}: ${preference.level}`}
            style={{
              fontSize: "0.75rem",
              padding: "0.1rem 0.4rem",
              borderRadius: "1rem",
              backgroundColor: "var(--pico-secondary-background-color)",
              border: "1px solid var(--pico-muted-border-color)",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            <strong>{getInitials(preference.name)}</strong>{" "}
            {getEmoji(preference.level)}
          </span>
        );
      })}
    </div>
  );
}

export default PreferenceList;
