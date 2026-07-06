import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { auth } from "../../middlewares/auth";
import { permit } from "../../middlewares/permission";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { createUserValidation, updateUserValidation } from "./user.validation";

const router = Router();

router.use(auth(), permit(PERMISSIONS.USERS_MANAGE));
router.post(
  "/",
  validateRequest(createUserValidation),
  UserController.createUser,
);
router.get("/", UserController.getUsers);
router.patch(
  "/:id",
  validateRequest(updateUserValidation),
  UserController.updateUser,
);

export const UserRoutes = router;
