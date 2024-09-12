import express from 'express';
import { createEntry, getEntriesByFolder, deleteEntry, updateEntry, getEntries, getEntryById } from '../controllers/entryController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create a new entry
router.post('/create', auth, createEntry);

// get all entries by folder id
router.get('/entries/:folder_id', auth, getEntriesByFolder);

// get all entries
router.get('/entry', auth, getEntries);

// get entry by entry id
router.get('/entry/:entry_id', auth, getEntryById);

// update entry
router.put('/entry/:entry_id', auth, updateEntry);


// Delete a entry
router.delete('/:entry_id', auth, deleteEntry);

export default router;