declare module "*.css";

type User = {
  id: number | bigint;
  email: string;
  name: string;
};

type Play = {
  id: number | bigint;
  title: string;
  description?: string;
};

type PlayMember = {
  id: number | bigint;
  play_id: number | bigint;
  user_id: number | bigint;
  role: "TEACHER" | "ACTOR";
};

type Scene = {
  id: number | bigint;
  play_id: number | bigint;
  title: string;
  description?: string;
  duration?: number;
  scene_order: number;
  is_active: boolean;
};

type Role = {
  id: number | bigint;
  play_id: number | bigint;
  name: string;
  description?: string;
};

type RoleWithScenes = Role & { scenes: Scene[] };

type PreferenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_INTERESTED";

type Preference = {
  user_id: number | bigint;
  scene_id: number | bigint;
  level: PreferenceLevel;
  created_at?: string;
};

type PreferenceWithUser = Preference & Omit<User, "id">;

type Casting = {
  role_id: number | bigint;
  user_id: number | bigint;
  assigned_at?: string;
};

type CastingMatrix = {
  scenes: Scene[];
  roles: (Role & {
    scene_ids: (number | bigint)[];
    user_id: number | bigint | null;
  })[];
};

type EventData = {
  id: number | bigint;
  play_id: number | bigint;
  type: "SHOW" | "FIXED_REHEARSAL" | "AUTO_REHEARSAL";
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
};

type MagicLinkToken = {
  id: number | bigint;
  user_id: number | bigint;
  token_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
};
