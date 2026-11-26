import { Router } from 'express';
import { showEditComment, handleUpdateComment, handleDeleteComment } from '../controller/commentController.js';
import { requireLogin } from '../middleware/auth.js';
import { commentRules } from '../middleware/validator.js';


const router = Router();

// Ownership and moderation checks happen in the controller.
router.get('/:id/edit', requireLogin, showEditComment);
router.post('/:id/edit', requireLogin, commentRules, handleUpdateComment);
router.post('/:id/delete', requireLogin, handleDeleteComment);

export default router;