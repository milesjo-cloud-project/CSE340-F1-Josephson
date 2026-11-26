import { Router } from 'express';
import { showHome, latestSeasonRedirect } from '../controller/homeController.js';

const router = Router();

router.get('/', showHome);
router.get('/drivers', latestSeasonRedirect('drivers'));
router.get('/teams', latestSeasonRedirect('teams'));
router.get('/races', latestSeasonRedirect('races'));

export default router;