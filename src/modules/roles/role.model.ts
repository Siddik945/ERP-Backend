import { Schema, model } from "mongoose";
import { allPermissions } from "../../constants/permissions";
import { UserRole } from "../../constants/roles";
import { IRole } from "./role.interface";

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      unique: true,
      trim: true,
    },
    description: { type: String, trim: true },
    permissions: [
      {
        type: String,
        enum: allPermissions,
        required: true,
      },
    ],
    isSystem: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Role = model<IRole>("Role", roleSchema);
