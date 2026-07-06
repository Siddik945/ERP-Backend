import { z } from "zod";
import { allPermissions } from "../../constants/permissions";

export const updateRolePermissionsValidation = z.object({
  body: z.object({
    permissions: z
      .array(z.enum(allPermissions as [string, ...string[]]))
      .min(1),
  }),
});
