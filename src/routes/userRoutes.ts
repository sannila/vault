import express from "express";
import {
  register,
  login,
  getUsersList,
  getUserById,
  udpateUserById,
  updatePassword,
  deleteUserById,
} from "../controllers/userController";

import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/register", auth, register);
router.post("/login", login);
router.get("/list", auth, getUsersList);
router.get("/user/:user_id", auth, getUserById);
router.put("/update/:user_id", auth, udpateUserById);
router.put("/password/:user_id", auth, updatePassword);
router.delete("/user/:user_id", auth, deleteUserById);

export default router;
