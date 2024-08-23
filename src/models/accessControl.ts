export interface AccessControl {
  access_id: number;
  user_id: number;
  vault_id?: number; // Or folder_id: number; depending on the use case
  access_level: string;
  granted_at: Date;
}
