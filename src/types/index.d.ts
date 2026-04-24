declare module "*.css";

type RowId = number | bigint;

type User = {
  id: RowId;
  email: string;
  name: string;
};

type Play = {
  id: RowId;
  title: string;
  description?: string;
};

type PlayMember = {
  id: RowId;
  play_id: RowId;
  user_id: RowId;
  role: "TEACHER" | "ACTOR";
};

type Scene = {
  id: RowId;
  play_id: RowId;
  title: string;
  description?: string;
  duration?: number;
  scene_order: number;
  is_active: boolean;
};

type Role = {
  id: RowId;
  play_id: RowId;
  name: string;
  description?: string;
};

type RoleWithScenes = Role & { scenes: Scene[] };

type PreferenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_INTERESTED";

type Preference = {
  user_id: RowId;
  scene_id: RowId;
  level: PreferenceLevel;
  created_at?: string;
};

type PreferenceWithUser = Preference & Omit<User, "id">;

type Casting = {
  role_id: RowId;
  user_id: RowId;
  assigned_at?: string;
};

type CastingMatrix = {
  scenes: Scene[];
  roles: (Role & {
    scene_ids: RowId[];
    user_id: RowId | null;
  })[];
};

type EventData = {
  id: RowId;
  play_id: RowId;
  type: "SHOW" | "FIXED_REHEARSAL" | "AUTO_REHEARSAL";
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
};

type MagicLinkToken = {
  user_id: RowId;
  token_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
};
