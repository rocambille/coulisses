type Item = {
  id: number;
  title: string;
  user_id: number;
};

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

type PreferenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_INTERESTED";

type Preference = {
  id: number;
  user_id: number;
  scene_id: number;
  level: PreferenceLevel;
  created_at?: string;
};

type Casting = {
  role_id: number;
  user_id: number;
  assigned_at?: string;
};
