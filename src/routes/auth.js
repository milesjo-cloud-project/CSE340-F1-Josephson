import { Router } from 'express';
import { showRegister, handleRegister } from '../controller/authController.js';
import { registerRules } from '../middleware/validator.js';

const router = Router();

router.get('/register', showRegister);
router.post('/register', registerRules, handleRegister);

export default router;

