type Credentials = {
  email: string;
  password: string;
};

type Item = {
  id: number;
  title: string;
  user_id: number;
};

type User = {
  id: number;
  email: string;
};

type UserWithPassword = User & {
  password: string;
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
  order: number;
  is_active: boolean;
};

type Role = {
  id: number;
  play_id: number;
  name: string;
  description: string | null;
};
