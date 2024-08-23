import express from 'express';
import { createEntry, getEntriesByFolder, deleteEntry } from '../controllers/entryController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create a new entry
router.post('/create', auth, createEntry);

// get all entries by folder id
router.get('/folder/:folder_id', auth, getEntriesByFolder);

// Delete a entry
router.delete('/:entry_id', auth, deleteEntry);

export default router;