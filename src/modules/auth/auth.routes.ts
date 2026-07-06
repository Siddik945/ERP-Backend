import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { loginValidation } from './auth.validation';

const router = Router();

router.post('/login', validateRequest(loginValidation), AuthController.login);
router.get('/me', auth(), AuthController.me);

export const AuthRoutes = router;
