import { Router } from 'express';
import { PreferencesController } from '../controllers/preferences.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.get('/', PreferencesController.getPreferences);
router.put('/', PreferencesController.updatePreferences);
router.post('/reset', PreferencesController.resetPreferences);

export default router;