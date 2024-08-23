import { Request, Response } from "express";
import { poolPromise } from "../config/db";
import { AccessControl } from "../models/accessControl";

export const grantAccess = async (req: any, res: Response) => {
  try {
    const { user_id, vault_id, access_level } = req.body;

    if (!user_id || !vault_id || !access_level) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", user_id)
      .input("vault_id", vault_id)
      .input("access_level", access_level)
      .query(`INSERT INTO AccessControl (user_id, vault_id, access_level, granted_at)
              VALUES (@user_id, @vault_id, @access_level, GETDATE());
              SELECT * FROM AccessControl WHERE access_id = SCOPE_IDENTITY();`);

    res.status(201).json({ message: "Access control successfully granted." });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const getAccessByVault = async (req: any, res: Response) => {
  try {
    const { vault_id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("vault_id", vault_id)
      .query("SELECT * FROM AccessControl WHERE vault_id = @vault_id");

    res.status(200).json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const revokeAccess = async (req: any, res: Response) => {
  try {
    const { access_id } = req.params;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("access_id", access_id)
      .query("DELETE FROM AccessControl WHERE access_id = @access_id");

    if(result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Access control not found." });
    }
    res.status(200).json({ message: "Access control successfully revoked." });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};
