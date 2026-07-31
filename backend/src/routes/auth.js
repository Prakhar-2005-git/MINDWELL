import express from 'express';
import { registerUser, loginUser, recoverUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/recover', recoverUser);

export default router;

