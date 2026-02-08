import { Router } from 'express';
import { TopicController } from '../controllers/topic.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Topic CRUD
router.post('/', TopicController.createTopic);
router.post('/bulk', TopicController.bulkCreateTopics);
router.get('/subject/:subjectId', TopicController.getTopicsBySubject);
router.get('/:id', TopicController.getTopicById);
router.put('/:id', TopicController.updateTopic);
router.delete('/:id', TopicController.deleteTopic);

// Special operations
router.patch('/:id/toggle', TopicController.toggleTopicCompletion);
router.put('/subject/:subjectId/reorder', TopicController.reorderTopics);

export default router;