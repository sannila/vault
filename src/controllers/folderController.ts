import { Request, Response } from "express";
import { poolPromise } from "../config/db";
import { Folder } from "../models/folder";

export const createFolder = async (req: any, res: Response) => {
  try {
    const { folder_name, vault_id, parent_folder_id } = req.body;
    if (!folder_name) {
      return res
        .status(400)
        .json({ message: "Please provide folder name" });
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
    
      if(duplicate.recordset.length > 0){
        return res.status(409).json({statusCode: 409, message: "Folder already exists"})
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
    res.status(201).json({message: "Folder created successfully"});
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

// getFolder by parentFolderId
export const getFoldersByParentFolderId = async (req: any, res: Response) => {
  try {
    const { parent_folder_id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("parent_folder_id", parent_folder_id)
      .query("SELECT * FROM folders WHERE parent_folder_id = @parent_folder_id");

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
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("folder_id", folder_id)
      .query("DELETE FROM folders WHERE folder_id = @folder_id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }
    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};
