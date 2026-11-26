import { Router } from 'express';
import { showRegister, handleRegister, showLogin, handleLogin, handleLogout } from '../controller/authController.js';
import { registerRules, loginRules } from '../middleware/validator.js';

const router = Router();

router.get('/register', showRegister);
router.post('/register', registerRules, handleRegister);

router.get('/login', showLogin);
router.post('/login', loginRules, handleLogin);
router.post('/logout', handleLogout)

export default router;

