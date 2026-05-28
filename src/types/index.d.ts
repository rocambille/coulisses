declare module "*.css";

type RowId = number | bigint;

type User = {
  id: RowId;
  email: string;
  name: string;
  created_at: string;
  deleted_at: string | null;
};

type MagicLinkToken = {
  user_id: RowId;
  token_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
};

type Troupe = {
  id: RowId;
  name: string;
  description: string;
  external_discussion_link: string;
  created_at: string;
};

type TroupeMember = User & {
  troupe_id: RowId;
  role: "ADMIN" | "ACTOR";
  joined_at: string;
};

type Play = {
  id: RowId;
  troupe_id: RowId;
  title: string;
  description: string;
};

type Scene = {
  id: RowId;
  play_id: RowId;
  title: string;
  description: string;
  cut_notes: string;
  order_in_play: number;
  duration_estimated_seconds: number;
  is_active: boolean;
};

type Role = {
  id: RowId;
  play_id: RowId;
  name: string;
  description: string;
};

type RoleWithScenes = Role & { scenes: Scene[] };

type PreferenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_INTERESTED";

type PlayPreference = {
  user_id: RowId;
  play_id: RowId;
  level: PreferenceLevel;
  created_at: string;
};

type ScenePreference = {
  user_id: RowId;
  scene_id: RowId;
  level: PreferenceLevel;
  created_at: string;
};

type RolePreference = {
  user_id: RowId;
  scene_id: RowId;
  role_id: RowId;
  level: PreferenceLevel;
  created_at: string;
};

type Casting = {
  user_id: RowId;
  scene_id: RowId;
  role_id: RowId;
  assigned_at: string;
};

type CastingMatrix = {
  actors: User[];
  scenes: Array<{
    id: RowId;
    title: string;
    order_in_play: number;
    roles: (Role & {
      preferences: Omit<RolePreference, "role_id" | "scene_id">[];
      assigned_user: User | null;
    })[];
  }>;
};

type EventType = "COURSE" | "REHEARSAL" | "SHOW" | "OTHER";

type EventData = {
  id: RowId;
  troupe_id: RowId;
  owner_id: RowId;
  type: EventType;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
};

type PresenceStatus = "PENDING" | "PRESENT" | "ABSENT";

type EventPresence = {
  event_id: RowId;
  user_id: RowId;
  status: PresenceStatus;
  updated_at: string;
};

type NavItem = {
  label: string;
  to: string;
};
