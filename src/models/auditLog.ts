export interface AuditLog {
  log_id: number;
  user_id: number;
  vault_id?: number;
  entry_id?: number;
  action: string;
  action_details?: string;
  timestamp: Date;
}
