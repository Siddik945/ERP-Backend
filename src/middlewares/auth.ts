import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/roles";
import { Role } from "../modules/roles/role.model";
import { User } from "../modules/users/user.model";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export const auth = (...allowedRoles: UserRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw new ApiError(401, "Authorization token is required");
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select(
        "_id email role isActive",
      );

      if (!user || !user.isActive) {
        throw new ApiError(401, "User is not authorized");
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        throw new ApiError(
          403,
          "You do not have permission to perform this action",
        );
      }

      const role = await Role.findOne({ name: user.role }).select(
        "permissions",
      );
      if (!role) {
        throw new ApiError(
          403,
          "Role permissions are not configured. Please run npm run seed.",
        );
      }

      req.user = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        permissions: role.permissions,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
