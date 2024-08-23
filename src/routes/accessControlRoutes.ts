import express from "express";
import {
  grantAccess,
  getAccessByVault,
  revokeAccess,
} from "../controllers/accessControlController";
import { auth } from "../middleware/auth";

const router = express.Router();

// Grant access to a user for a vault (or folder)
router.post("/grant", auth, grantAccess);

// Get all access controls for a specific vault (or folder)
router.get("/vault/:vault_id", auth, getAccessByVault);

// Revoke access from a user
router.delete("/:access_id", auth, revokeAccess);

export default router;
