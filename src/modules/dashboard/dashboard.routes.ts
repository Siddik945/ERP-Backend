import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { auth } from "../../middlewares/auth";
import { permit } from "../../middlewares/permission";
import { DashboardController } from "./dashboard.controller";

const router = Router();

router.get(
  "/",
  auth(),
  permit(PERMISSIONS.DASHBOARD_VIEW),
  DashboardController.getDashboardStats,
);

export const DashboardRoutes = router;
