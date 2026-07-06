import { Router } from 'express';
import { UserRole } from '../../constants/roles';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { createUserValidation, updateUserValidation } from './user.validation';

const router = Router();

router.use(auth(UserRole.ADMIN));
router.post('/', validateRequest(createUserValidation), UserController.createUser);
router.get('/', UserController.getUsers);
router.patch('/:id', validateRequest(updateUserValidation), UserController.updateUser);

export const UserRoutes = router;
