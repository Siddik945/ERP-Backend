import {
  allPermissions,
  permissionGroups,
  PermissionKey,
  PERMISSIONS,
} from "../../constants/permissions";
import { UserRole } from "../../constants/roles";
import { ApiError } from "../../utils/ApiError";
import { Role } from "./role.model";

const getRoles = async () => {
  return Role.find().sort({ name: 1 });
};

const getPermissionList = async () => {
  return {
    permissions: allPermissions,
    groups: permissionGroups,
  };
};

const updateRolePermissions = async (
  id: string,
  permissions: PermissionKey[],
) => {
  const invalidPermissions = permissions.filter(
    (permission) => !allPermissions.includes(permission),
  );
  if (invalidPermissions.length) {
    throw new ApiError(
      400,
      `Invalid permissions: ${invalidPermissions.join(", ")}`,
    );
  }

  const role = await Role.findById(id);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  if (
    role.name === UserRole.ADMIN &&
    !permissions.includes(PERMISSIONS.ROLES_MANAGE)
  ) {
    throw new ApiError(400, "Admin role must keep roles.manage permission");
  }

  role.permissions = [...new Set(permissions)];
  await role.save();

  return role;
};

export const RoleService = {
  getRoles,
  getPermissionList,
  updateRolePermissions,
};
