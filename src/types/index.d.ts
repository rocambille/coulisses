declare module "*.css";

type RowId = number | bigint;

type Item = {
  id: RowId;
  title: string;
  user_id: RowId;
};

type User = {
  id: RowId;
  email: string;
  name: string;
};

type MagicLinkToken = {
  user_id: RowId;
  token_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
};
