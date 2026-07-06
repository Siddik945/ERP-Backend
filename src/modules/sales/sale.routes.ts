import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { auth } from "../../middlewares/auth";
import { permit } from "../../middlewares/permission";
import { validateRequest } from "../../middlewares/validateRequest";
import { SaleController } from "./sale.controller";
import { createSaleValidation } from "./sale.validation";

const router = Router();

router.post(
  "/",
  auth(),
  permit(PERMISSIONS.SALES_CREATE),
  validateRequest(createSaleValidation),
  SaleController.createSale,
);
router.get(
  "/",
  auth(),
  permit(PERMISSIONS.SALES_VIEW),
  SaleController.getSales,
);

export const SaleRoutes = router;
