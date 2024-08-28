import express from 'express';
import { createFolder, getFoldersByVault, deleteFolder, getFoldersByParentFolderId } from '../controllers/folderController';
import { auth } from '../middleware/auth';

const router = express.Router();

// create a new folder
router.post('/create', auth, createFolder);

// get all folders in a vault
router.get('/folder/:vault_id', auth, getFoldersByVault);

router.get('/parent_folder/:parent_folder_id', auth, getFoldersByParentFolderId);

// Delete folder
router.delete('/:folder_id', auth, deleteFolder);

export default router;