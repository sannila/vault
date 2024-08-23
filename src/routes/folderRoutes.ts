import express from 'express';
import { createFolder, getFoldersByVault, deleteFolder } from '../controllers/folderController';
import { auth } from '../middleware/auth';

const router = express.Router();

// create a new folder
router.post('/create', auth, createFolder);

// get all folders in a vault
router.get('/vault/:vault_id', auth, getFoldersByVault);

// Delete folder
router.delete('/:folder_id', auth, deleteFolder);

export default router;