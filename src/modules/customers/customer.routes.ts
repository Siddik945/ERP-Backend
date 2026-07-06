import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { auth } from "../../middlewares/auth";
import { permit } from "../../middlewares/permission";
import { validateRequest } from "../../middlewares/validateRequest";
import { CustomerController } from "./customer.controller";
import {
  createCustomerValidation,
  updateCustomerValidation,
} from "./customer.validation";

const router = Router();

router.get(
  "/",
  auth(),
  permit(PERMISSIONS.CUSTOMERS_VIEW),
  CustomerController.getCustomers,
);
router.get(
  "/:id",
  auth(),
  permit(PERMISSIONS.CUSTOMERS_VIEW),
  CustomerController.getCustomerById,
);
router.post(
  "/",
  auth(),
  permit(PERMISSIONS.CUSTOMERS_CREATE),
  validateRequest(createCustomerValidation),
  CustomerController.createCustomer,
);
router.patch(
  "/:id",
  auth(),
  permit(PERMISSIONS.CUSTOMERS_UPDATE),
  validateRequest(updateCustomerValidation),
  CustomerController.updateCustomer,
);
router.delete(
  "/:id",
  auth(),
  permit(PERMISSIONS.CUSTOMERS_DELETE),
  CustomerController.deleteCustomer,
);

export const CustomerRoutes = router;
