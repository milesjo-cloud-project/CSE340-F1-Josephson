import { Router } from 'express';
import { showNews, showArticle, showNewArticle, handleCreateArticle, showEditArticle, handleUpdateArticle, handleDeleteArticle, } from '../controller/newsController.js';
import { requireRole } from '../middleware/auth.js';
import { articleRules } from '../middleware/validator.js';

const router = Router();
const staff = requireRole('admin', 'editor');

router.get('/', showNews);
router.get('/new', staff, showNewArticle);
router.post('/new', staff, articleRules, handleCreateArticle);
router.get('/:id/edit', staff, showEditArticle);
router.post('/:id/edit', staff, articleRules, handleUpdateArticle);
router.post('/:id/delete', staff, handleDeleteArticle);
router.get('/:slug', showArticle);

export default router;