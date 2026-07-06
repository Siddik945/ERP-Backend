import { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RoleService } from "./role.service";

const getRoles: RequestHandler = catchAsync(async (_req, res) => {
  const result = await RoleService.getRoles();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Roles retrieved successfully",
    data: result,
  });
});

const getPermissionList: RequestHandler = catchAsync(async (_req, res) => {
  const result = await RoleService.getPermissionList();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Permissions retrieved successfully",
    data: result,
  });
});

const updateRolePermissions: RequestHandler = catchAsync(async (req, res) => {
  const result = await RoleService.updateRolePermissions(
    req.params.id,
    req.body.permissions,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Role permissions updated successfully",
    data: result,
  });
});

export const RoleController = {
  getRoles,
  getPermissionList,
  updateRolePermissions,
};
