declare module "*.css";

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

type MagicLinkToken = {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
};
