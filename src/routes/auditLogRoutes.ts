import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all audit logs
router.get('/', auth, getAuditLogs);

export default router;