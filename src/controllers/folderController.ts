import { Request, Response } from "express";
import { poolPromise } from "../config/db";
import { Folder } from "../models/folder";
import { createAuditLog } from "./auditLogController";

export const createFolder = async (req: any, res: Response) => {
  try {
    const { folder_name, vault_id, parent_folder_id } = req.body;
    if (!folder_name) {
      return res.status(400).json({ message: "Please provide folder name" });
    }
    const pool = await poolPromise;

    // Check for duplicates folder
    const duplicate = await pool
      .request()
      .input("folder_name", folder_name)
      .input("vault_id", vault_id)
      .query(
        "SELECT * FROM folders WHERE folder_name = @folder_name AND vault_id = @vault_id"
      );

    if (duplicate.recordset.length > 0) {
      return res
        .status(409)
        .json({ statusCode: 409, message: "Folder already exists" });
    }

    const result = await pool
      .request()
      .input("folder_name", folder_name)
      .input("vault_id", vault_id)
      .input("parent_folder_id", parent_folder_id || null)
      .query(
        "INSERT INTO folders (folder_name, vault_id, parent_folder_id) VALUES (@folder_name, @vault_id, @parent_folder_id)"
      );

    // const folder: Folder = result.recordset[0];
    res.status(201).json({ message: "Folder created successfully" });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const getFoldersByVault = async (req: any, res: Response) => {
  try {
    const { vault_id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("vault_id", vault_id)
      .query("SELECT * FROM folders WHERE vault_id = @vault_id");

    const folders: Folder[] = result.recordset;
    res.status(200).json(folders);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

// get all folders
export const getAllFolders = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM folders AND deleted = 0");

    const folders: Folder[] = result.recordset;
    res.status(200).json(folders);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

// getFolder by parentFolderId
export const getFoldersByParentFolderId = async (req: any, res: Response) => {
  try {
    const { parent_folder_id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("parent_folder_id", parent_folder_id)
      .query(
        "SELECT * FROM folders WHERE parent_folder_id = @parent_folder_id AND deleted = 0"
      );

    const folders: Folder[] = result.recordset;
    res.status(200).json(folders);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

// get all folders where parent_folder_id is null
export const getRootFolders = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM folders WHERE parent_folder_id IS NULL AND deleted = 0");

    const folders: Folder[] = result.recordset;
    res.status(200).json(folders);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

// get all folders where parent_folder_id is not null
export const getChildFolders = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM folders WHERE parent_folder_id IS NOT NULL AND deleted = 0");

    const folders: Folder[] = result.recordset;
    res.status(200).json(folders);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

// Delete a folder
export const deleteFolder = async (req: any, res: Response) => {
  try {
    const { folder_id } = req.params;
    const user_id = req.user?.user_id;
    const pool = await poolPromise;

    const folderResult = await pool
      .request()
      .input("folder_id", folder_id)
      .query(
        "SELECT * FROM folders WHERE folder_id = @folder_id AND deleted = 0"
      );

    if (folderResult.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const entry = folderResult.recordset[0];

    const result = await pool
      .request()
      .input("folder_id", folder_id)
      .query("UPDATE folders SET deleted = 1 WHERE folder_id = @folder_id");

    await createAuditLog(
      user_id,
      null,
      folder_id,
      "Deleted",
      `Folder deleted with name: ${entry.folder_name}`
    );
    // .query("DELETE FROM folders WHERE folder_id = @folder_id");

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};
