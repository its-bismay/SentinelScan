import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { scanLimiter } from '../middleware/rateLimiter.js';
import { createScan, getScans, getScan, deleteScan, getScanProgress } from '../controllers/scan.controller.js';

const router = Router();

router.use(protect);
router.post('/', scanLimiter, createScan);
router.get('/', getScans);
router.get('/:id', getScan);
router.delete('/:id', deleteScan);
router.get('/:id/progress', getScanProgress);

export default router;
