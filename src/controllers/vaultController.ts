import { Request, Response } from 'express';
import { poolPromise } from '../config/db';
import { Vault } from '../models/vault';
import { createAuditLog } from './auditLogController';

export const createVault = async (req: any, res: Response) => {
  try {
    const { vault_name } = req.body;
    const user_id = req.user?.user_id;

    if (!vault_name) {
      return res.status(400).json({ error: 'Vault name is required' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('vault_name', vault_name)
      .input('user_id', user_id)
      .query(`INSERT INTO Vaults (vault_name, user_id, created_at, updated_at)
              VALUES (@vault_name, @user_id, GETDATE(), GETDATE());
              SELECT * FROM Vaults WHERE vault_id = SCOPE_IDENTITY();`);

    const vault: Vault = result.recordset[0];
    await createAuditLog(user_id, vault.vault_id, null, "Created", `Created vault with name: ${vault_name}`)
    res.status(201).json({message: "Vault created successfully"});
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const getVaults = async (req: any, res: Response) => {
  try {
    const user_id = req.user?.user_id;

    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Vaults');

    const vaults: Vault[] = result.recordset;
    res.status(200).json(vaults);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const deleteVault = async (req: any, res: Response) => {
  try {
    const { vault_id } = req.params;
    const user_id = req.user?.user_id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('vault_id', vault_id)
      .input('user_id', user_id)
      .query('DELETE FROM Vaults WHERE vault_id = @vault_id AND user_id = @user_id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ errorMessage: 'Vault not found or not authorized' });
    }

    res.status(200).json({ message: 'Vault deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};
