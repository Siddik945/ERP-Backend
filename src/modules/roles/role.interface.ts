import { Document, Types } from "mongoose";
import { PermissionKey } from "../../constants/permissions";
import { UserRole } from "../../constants/roles";

export interface IRole extends Document<Types.ObjectId> {
  name: UserRole;
  description?: string;
  permissions: PermissionKey[];
  isSystem: boolean;
}
