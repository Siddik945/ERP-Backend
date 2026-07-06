import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { SaleController } from './sale.controller';
import { createSaleValidation } from './sale.validation';

const router = Router();

router.post('/', auth(), validateRequest(createSaleValidation), SaleController.createSale);
router.get('/', auth(), SaleController.getSales);

export const SaleRoutes = router;
