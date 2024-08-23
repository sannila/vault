import express from 'express';
import { createVault, deleteVault, getVaults} from '../controllers/vaultController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create a new vault
router.post('/create', auth, createVault);

// Get all vaults for the authenticated user
router.get('/list', auth, getVaults);

// Delete a vault
router.delete('/:vault_id', auth, deleteVault);

export default router;
