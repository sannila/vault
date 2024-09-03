import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { poolPromise } from "../config/db";
import { User } from "../models/user";

const saltRounds = 10;

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide username, email and password" });
    }

    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await pool
      .request()
      .input("email", email)
      .query("SELECT * FROM Users WHERE email = @email");

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const existingUsername = await pool
      .request()
      .input("username", username)
      .query("SELECT * FROM Users WHERE username = @username");

    if (existingUsername.recordset.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const result = await pool
      .request()
      .input("username", username)
      .input("email", email)
      .input("hashed_password", hashedPassword)
      .query(
        `INSERT INTO Users (username, email, hashed_password) VALUES (@username, @email, @hashed_password)`
      );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", email)
      .query(`SELECT * FROM Users WHERE email = @email`);

    const user: User = result.recordset[0];

    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.hashed_password);

    if (!isMatch) {
      return res.status(400).json({ errorMessage: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET!,
      {
        expiresIn: "2h",
      }
    );

    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const getUsersList = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Users");
    res.json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", user_id)
      .query("SELECT * FROM Users WHERE user_id = @user_id");
    res.json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const udpateUserById = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    const { username, email, role } = req.body;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", user_id)
      .input("username", username)
      .input("email", email)
      .input("role", role)
      .query(
        "UPDATE Users SET username = @username, email = @email, role = @role WHERE user_id = @user_id"
      );
    res.json({ message: "User updated successfully" });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};

export const updatePassword = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    const { password } = req.body;
    const hashed_password = await bcrypt.hash(password, saltRounds);
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", user_id)
      .input("hashed_password", hashed_password)
      .query(
        "UPDATE Users SET hashed_password = @hashed_password WHERE user_id = @user_id"
      );
    res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};


export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", user_id)
      .query("DELETE FROM Users WHERE user_id = @user_id");
    res.json({ message: "User deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ errorMessage: err.message });
  }
};