import express from 'express';
import { createEncryptionKey, getEncryptionKeyByUser, deleteEncryptionKey } from '../controllers/encryptionKeyController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create a new encryption key for a user
router.post('/create', auth, createEncryptionKey);

// Get an encryption key for a specific user
router.get('/user/:user_id', auth, getEncryptionKeyByUser);

// Delete an encryption key
router.delete('/:key_id', auth, deleteEncryptionKey);

export default router;
