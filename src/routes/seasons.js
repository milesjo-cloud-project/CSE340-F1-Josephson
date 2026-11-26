import { Router } from 'express';
import { showDrivers, showDriver, showTeams, showRaces, showRace } from '../controller/seasonController.js';
import { handleCreateComment } from '../controller/commentController.js';
import { requireLogin } from '../middleware/auth.js';
import { commentRules } from '../middleware/validator.js';

const router = Router();

router.get('/:season/drivers', showDrivers);
router.get('/:season/drivers/:slug', showDriver);
router.get('/:season/teams', showTeams);
router.get('/:season/races', showRaces);
router.get('/:season/races/:round', showRace);
router.post('/:season/races/:round/comments', requireLogin, commentRules, handleCreateComment);

export default router;