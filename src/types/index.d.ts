type User = {
  id: number;
  email: string;
  name: string;
};

type Play = {
  id: number;
  title: string;
  description: string | null;
};

type PlayMember = {
  id: number;
  play_id: number;
  user_id: number;
  role: "TEACHER" | "ACTOR";
};

type Scene = {
  id: number;
  play_id: number;
  title: string;
  description: string | null;
  duration: number | null;
  scene_order: number;
  is_active: boolean;
};

type Role = {
  id: number;
  play_id: number;
  name: string;
  description: string | null;
};

type RoleWithScenes = Role & { scenes: Scene[] };

type PreferenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_INTERESTED";

type Preference = {
  user_id: number;
  scene_id: number;
  level: PreferenceLevel;
  created_at?: string;
};

type PreferenceWithUser = Preference & Omit<User, "id">;

type Casting = {
  role_id: number;
  user_id: number;
  assigned_at?: string;
};

type CastingMatrix = {
  scenes: Scene[];
  roles: (Role & { scene_ids: number[]; user_id: number | null })[];
};

type EventData = {
  id: number;
  play_id: number;
  type: "SHOW" | "FIXED_REHEARSAL" | "AUTO_REHEARSAL";
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
};
