import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { auth } from "../../middlewares/auth";
import { permit } from "../../middlewares/permission";
import { upload } from "../../middlewares/upload";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProductController } from "./product.controller";
import {
  createProductValidation,
  updateProductValidation,
} from "./product.validation";

const router = Router();

router.get(
  "/",
  auth(),
  permit(PERMISSIONS.PRODUCTS_VIEW),
  ProductController.getProducts,
);
router.get(
  "/:id",
  auth(),
  permit(PERMISSIONS.PRODUCTS_VIEW),
  ProductController.getProductById,
);
router.post(
  "/",
  auth(),
  permit(PERMISSIONS.PRODUCTS_CREATE),
  upload.single("image"),
  validateRequest(createProductValidation),
  ProductController.createProduct,
);
router.patch(
  "/:id",
  auth(),
  permit(PERMISSIONS.PRODUCTS_UPDATE),
  upload.single("image"),
  validateRequest(updateProductValidation),
  ProductController.updateProduct,
);
router.delete(
  "/:id",
  auth(),
  permit(PERMISSIONS.PRODUCTS_DELETE),
  ProductController.deleteProduct,
);

export const ProductRoutes = router;
