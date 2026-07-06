import { NextFunction, Request, Response } from "express";
import { PermissionKey } from "../constants/permissions";
import { ApiError } from "../utils/ApiError";

export const permit = (...requiredPermissions: PermissionKey[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "You are not authenticated");
      }

      const userPermissions = req.user.permissions || [];
      const hasEveryPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasEveryPermission) {
        throw new ApiError(
          403,
          "You do not have permission to perform this action",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
