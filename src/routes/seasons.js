import { Router } from 'express';
import { showDrivers, showDriver, showTeams, showRaces, showRace } from '../controller/seasonController.js';

const router = Router();

router.get('/:season/drivers', showDrivers);
router.get('/:season/drivers/:slug', showDriver);
router.get('/:season/teams', showTeams);
router.get('/:season/races', showRaces);
router.get('/:season/races/:round', showRace)

export default router;