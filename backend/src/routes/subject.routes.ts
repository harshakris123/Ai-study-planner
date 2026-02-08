import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected (require authentication)
router.use(authMiddleware);

// Subject CRUD
router.post('/', SubjectController.createSubject);
router.get('/', SubjectController.getAllSubjects);
router.get('/stats', SubjectController.getSubjectStats);
router.get('/:id', SubjectController.getSubjectById);
router.put('/:id', SubjectController.updateSubject);
router.delete('/:id', SubjectController.deleteSubject);

export default router;