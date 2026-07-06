import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { auth } from "../../middlewares/auth";
import { permit } from "../../middlewares/permission";
import { validateRequest } from "../../middlewares/validateRequest";
import { RoleController } from "./role.controller";
import { updateRolePermissionsValidation } from "./role.validation";

const router = Router();

router.use(auth(), permit(PERMISSIONS.ROLES_MANAGE));

router.get("/", RoleController.getRoles);
router.get("/permissions", RoleController.getPermissionList);
router.patch(
  "/:id/permissions",
  validateRequest(updateRolePermissionsValidation),
  RoleController.updateRolePermissions,
);

export const RoleRoutes = router;
