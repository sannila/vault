import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { poolPromise } from "./db";
import { User } from "../models/user";

passport.serializeUser((user: any, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('user_id', id).query('SELECT * FROM Users WHERE user_id = @user_id');
    const user: User = result.recordset[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});