import { useOutletContext, useParams } from "react-router";
import { useMe } from "../auth/MeContext";
import PreferenceSelector from "../ui/PreferenceSelector";
import RoleBadge from "../ui/RoleBadge";

interface SceneCardProps {
  scene: Scene;
  roles: RoleWithScenes[];
  scenePreferences: ScenePreference[];
  rolePreferences: RolePreference[];
  onEdit: (sceneId: number) => void;
  onDelete: (sceneId: number) => void;
}

export default function SceneCard({
  scene,
  roles,
  scenePreferences,
  rolePreferences,
  onEdit,
  onDelete,
}: SceneCardProps) {
  const { playId } = useParams();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();
  const { user } = useMe();

  const myScenePreference = scenePreferences.find(
    (p) => p.scene_id === scene.id && p.user_id === user?.id,
  );

  return (
    <article style={{ opacity: scene.is_active ? 1 : 0.5 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <strong>
          {scene.order_in_play}. {scene.title}
        </strong>
        <PreferenceSelector
          sceneId={Number(scene.id)}
          playId={String(playId)}
          currentLevel={myScenePreference?.level}
        />
      </header>

      <p>
        <em>{scene.description || "Aucune description"}</em>
      </p>

      <div
        style={{
          fontSize: "smaller",
          color: "var(--pico-muted-color)",
          marginBottom: "1rem",
        }}
      >
        <span>⏱️ {scene.duration_estimated_seconds / 60} min</span>
        {scene.cut_notes && (
          <span style={{ marginLeft: "1rem" }}>✂️ {scene.cut_notes}</span>
        )}
      </div>

      <div>
        <strong>Rôles dans la scène:</strong>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          {roles.length === 0 ? (
            <span className="muted">Aucun rôle défini</span>
          ) : (
            roles.map((role) => {
              const myRolePreference = rolePreferences.find(
                (p) => p.role_id === role.id && p.user_id === user?.id,
              );
              return (
                <div
                  key={role.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: "1px solid var(--pico-muted-border-color)",
                    padding: "0.5rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  <RoleBadge name={role.name} />
                  <PreferenceSelector
                    sceneId={Number(scene.id)}
                    roleId={Number(role.id)}
                    playId={String(playId)}
                    currentLevel={myRolePreference?.level}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {isAdmin && (
        <footer style={{ marginTop: "1rem" }}>
          <button
            aria-label={`Modifier la scène ${scene.id}`}
            type="button"
            className="secondary outline"
            onClick={() => onEdit(Number(scene.id))}
            style={{ marginRight: "0.5rem" }}
          >
            Modifier
          </button>
          <button
            aria-label={`Supprimer la scène ${scene.id}`}
            type="button"
            className="contrast outline"
            onClick={() => onDelete(Number(scene.id))}
          >
            Supprimer
          </button>
        </footer>
      )}
    </article>
  );
}
