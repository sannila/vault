export interface Folder {
  folder_id: number;
  folder_name: string;
  vault_id: number;
  parent_folder_id?: number | null;
  created_at: Date;
  updated_at: Date;
}
