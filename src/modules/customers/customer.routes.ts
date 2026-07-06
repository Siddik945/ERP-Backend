import { Router } from 'express';
import { UserRole } from '../../constants/roles';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { CustomerController } from './customer.controller';
import { createCustomerValidation, updateCustomerValidation } from './customer.validation';

const router = Router();

router.get('/', auth(), CustomerController.getCustomers);
router.get('/:id', auth(), CustomerController.getCustomerById);
router.post('/', auth(UserRole.ADMIN, UserRole.MANAGER), validateRequest(createCustomerValidation), CustomerController.createCustomer);
router.patch('/:id', auth(UserRole.ADMIN, UserRole.MANAGER), validateRequest(updateCustomerValidation), CustomerController.updateCustomer);
router.delete('/:id', auth(UserRole.ADMIN, UserRole.MANAGER), CustomerController.deleteCustomer);

export const CustomerRoutes = router;
