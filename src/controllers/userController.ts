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

    if(existingUser.recordset.length > 0) {
        return res.status(400).json({ error: "User already exists" });
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
      const result = await pool.request()
        .input('email', email)
        .query(`SELECT * FROM Users WHERE email = @email`);
  
      const user: User = result.recordset[0];
  
      if (!user) {
        return res.status(404).json({ errorMessage: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(password, user.hashed_password);
  
      if (!isMatch) {
        return res.status(400).json({ errorMessage: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ user_id: user.user_id, username: user.username }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });
  
      res.json({ token });
    } catch (err: any) {
      res.status(500).json({ errorMessage: err.message });
    }
  };