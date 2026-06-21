import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/generate-plan', AIController.generatePlan);
router.post('/calculate-load', AIController.calculateLoad);
router.get('/load-today', AIController.getTodayLoad);

export default router;  