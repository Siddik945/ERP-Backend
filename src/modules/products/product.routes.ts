import { Router } from 'express';
import { UserRole } from '../../constants/roles';
import { auth } from '../../middlewares/auth';
import { upload } from '../../middlewares/upload';
import { validateRequest } from '../../middlewares/validateRequest';
import { ProductController } from './product.controller';
import { createProductValidation, updateProductValidation } from './product.validation';

const router = Router();

router.get('/', auth(), ProductController.getProducts);
router.get('/:id', auth(), ProductController.getProductById);
router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.MANAGER),
  upload.single('image'),
  validateRequest(createProductValidation),
  ProductController.createProduct
);
router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.MANAGER),
  upload.single('image'),
  validateRequest(updateProductValidation),
  ProductController.updateProduct
);
router.delete('/:id', auth(UserRole.ADMIN, UserRole.MANAGER), ProductController.deleteProduct);

export const ProductRoutes = router;
