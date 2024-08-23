import { Request, Response } from "express";
import { poolPromise } from "../config/db";
import { AuditLog } from "../models/auditLog";

export const createAuditLog = async (
  user_id: number,
  vault_id: number | null,
  entry_id: number | null,
  action: string,
  action_details: string | null
) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("user_id", user_id)
      .input("vault_id", vault_id)
      .input("entry_id", entry_id)
      .input("action", action)
      .input("action_details", action_details)
      .query(`INSERT INTO AuditLogs (user_id, vault_id, entry_id, action, action_details, timestamp)
                VALUES (@user_id, @vault_id, @entry_id, @action, @action_details, GETDATE());`);
  } catch (err) {
    console.error("Failed to create audit log:", err);
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM AuditLogs");
    const auditLogs: AuditLog[] = result.recordset;
    res.status(200).json(auditLogs);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};