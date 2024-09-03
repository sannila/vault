import { Request, Response } from "express";
import { poolPromise } from "../config/db";
import { Entry } from "../models/entry";
import bcrypt from "bcryptjs";
import { createAuditLog } from "./auditLogController";

const saltRounds = 10;

export const createEntry = async (req: any, res: Response) => {
  try {
    const { entry_name, username, password, url, notes, folder_id } = req.body;
    const user_id = req.user?.user_id;
    if (!entry_name || !folder_id) {
      return res
        .status(400)
        .json({ message: "Please provide entry name and folder id" });
    }

    // const hashedPassword = await bcrypt.hash(password, saltRounds);

    const pool = await poolPromise;

    // Check for duplicate entry
    const existingEntry = await pool
      .request()
      .input("url", url)
      .input("folder_id", folder_id)
      .query(
        "SELECT * FROM entries WHERE url = @url AND folder_id = @folder_id"
      );

    if (existingEntry.recordset.length > 0) {
      return res
        .status(409)
        .json({
          statusCode: 409,
          message: "Entry already exists with given URL",
        });
    }

    const result = await pool
      .request()
      .input("entry_name", entry_name)
      .input("username", username)
      .input("password", password)
      .input("url", url)
      .input("notes", notes)
      .input("folder_id", folder_id)
      .query(
        `INSERT INTO entries (entry_name, username, password, url, notes, folder_id) 
        VALUES (@entry_name, @username, @password, @url, @notes, @folder_id);
        SELECT * FROM Entries WHERE entry_id = SCOPE_IDENTITY();`
      );

    // if(!result.recordset || result.recordset.length ===0){
    //     return res.status(404).json({message: result})
    // }
    const entry: Entry = result.recordset[0];
    await createAuditLog(
      user_id,
      null,
      entry.entry_id,
      "Created",
      `Created entry with name: ${entry_name}`
    );
    res
      .status(201)
      .json({ statusCode: 201, message: "Entry created successfully" });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const getEntriesByFolder = async (req: any, res: Response) => {
  try {
    const { folder_id } = req.params;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("folder_id", folder_id)
      .query("SELECT * FROM entries WHERE folder_id = @folder_id AND deleted = 0");

    const entries: Entry[] = result.recordset;
    res.status(200).json(entries);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const deleteEntry = async (req: any, res: Response) => {
  try {
    const { entry_id } = req.params;
    const user_id = req.user?.user_id;

    const pool = await poolPromise;

    const entryResult = await pool
      .request()
      .input("entry_id", entry_id)
      .query(
        "SELECT * FROM Entries WHERE entry_id = @entry_id AND deleted = 0"
      );

    if (entryResult.recordset.length === 0) {
      return res.status(404).json({ errorMessage: "Entry not found" });
    }

    const entry = entryResult.recordset[0];

    const result = await pool
      .request()
      .input("entry_id", entry_id)
      .query("UPDATE Entries SET deleted = 1 WHERE entry_id = @entry_id");

    await createAuditLog(
      user_id,
      entry.vault_id,
      entry_id,
      "Deleted",
      `Entry deleted with name: ${entry.entry_name}`
    );
    res.status(200).json({ statusCode: 200, message: "Entry deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const updateEntry = async (req: any, res: Response) => {
  try {
    const { entry_id } = req.params;
    const { entry_name, username, password, url, notes, folder_id } = req.body;
    const user_id = req.user?.user_id;
    if (!entry_name || !folder_id) {
      return res
        .status(400)
        .json({ message: "Please provide entry name and folder id" });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("entry_id", entry_id)
      .input("entry_name", entry_name)
      .input("username", username)
      .input("password", password)
      .input("url", url)
      .input("notes", notes)
      .input("folder_id", folder_id)
      .input("updated_at", new Date())
      .query(
        `UPDATE entries SET entry_name = @entry_name, username = @username, password = @password, url = @url, notes = @notes, folder_id = @folder_id, updated_at = @updated_at WHERE entry_id = @entry_id`
      );
    
    await createAuditLog(
      user_id,
      null,
      entry_id,
      "Updated",
      `Updated entry with name: ${entry_name}`
    );

    res
      .status(200)
      .json({ statusCode: 200, message: "Entry updated successfully" });
  } catch (error) {
    res.status(500).json({ statusCode: 500, errorMessage: error });
  }
};
