export interface Entry {
    entry_id: number;
    folder_id: number;
    entry_name: string;
    username: string;
    password: string;
    url: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
  }
  