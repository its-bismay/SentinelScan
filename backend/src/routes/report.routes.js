import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { generateReport, getReport, askAssistant } from '../controllers/report.controller.js';

const router = Router();
router.use(protect);
router.post('/generate/:scanId', generateReport);
router.post('/analyze', askAssistant);
router.get('/:scanId', getReport);


export default router;
