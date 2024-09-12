import express from 'express';
import { createFolder, getFoldersByVault, deleteFolder, getFoldersByParentFolderId, getRootFolders, getChildFolders, getAllFolders } from '../controllers/folderController';
import { auth } from '../middleware/auth';

const router = express.Router();

// create a new folder
router.post('/create', auth, createFolder);

router.get('/folders', auth, getAllFolders);

// get all folders in a vault
router.get('/folder/:vault_id', auth, getFoldersByVault);

router.get('/root_folder', auth, getRootFolders);

router.get('/parent_folder/:parent_folder_id', auth, getFoldersByParentFolderId);

router.get('/child_folder', auth, getChildFolders);

// Delete folder
router.delete('/:folder_id', auth, deleteFolder);

export default router;