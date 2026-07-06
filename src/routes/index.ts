import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CustomerRoutes } from "../modules/customers/customer.routes";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes";
import { ProductRoutes } from "../modules/products/product.routes";
import { RoleRoutes } from "../modules/roles/role.routes";
import { SaleRoutes } from "../modules/sales/sale.routes";
import { UserRoutes } from "../modules/users/user.routes";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/roles", RoleRoutes);
router.use("/customers", CustomerRoutes);
router.use("/products", ProductRoutes);
router.use("/sales", SaleRoutes);
router.use("/dashboard", DashboardRoutes);

export const apiRoutes = router;
