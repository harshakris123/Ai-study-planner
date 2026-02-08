import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Session CRUD
router.post('/', SessionController.createSession);
router.get('/', SessionController.getAllSessions);
router.get('/stats', SessionController.getSessionStats);
router.get('/:id', SessionController.getSessionById);
router.put('/:id', SessionController.updateSession);
router.delete('/:id', SessionController.deleteSession);

// Special operations
router.patch('/:id/start', SessionController.startSession);
router.patch('/:id/complete', SessionController.completeSession);

export default router;