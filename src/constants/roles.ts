export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee'
}

export const allRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] as const;
