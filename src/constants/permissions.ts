export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",

  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",

  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_UPDATE: "customers.update",
  CUSTOMERS_DELETE: "customers.delete",

  SALES_CREATE: "sales.create",
  SALES_VIEW: "sales.view",

  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const allPermissions = Object.values(PERMISSIONS);

export const permissionGroups = [
  {
    module: "Dashboard",
    permissions: [{ key: PERMISSIONS.DASHBOARD_VIEW, label: "View dashboard" }],
  },
  {
    module: "Products",
    permissions: [
      { key: PERMISSIONS.PRODUCTS_VIEW, label: "View products" },
      { key: PERMISSIONS.PRODUCTS_CREATE, label: "Create products" },
      { key: PERMISSIONS.PRODUCTS_UPDATE, label: "Update products" },
      { key: PERMISSIONS.PRODUCTS_DELETE, label: "Delete products" },
    ],
  },
  {
    module: "Customers",
    permissions: [
      { key: PERMISSIONS.CUSTOMERS_VIEW, label: "View customers" },
      { key: PERMISSIONS.CUSTOMERS_CREATE, label: "Create customers" },
      { key: PERMISSIONS.CUSTOMERS_UPDATE, label: "Update customers" },
      { key: PERMISSIONS.CUSTOMERS_DELETE, label: "Delete customers" },
    ],
  },
  {
    module: "Sales",
    permissions: [
      { key: PERMISSIONS.SALES_CREATE, label: "Create sales" },
      { key: PERMISSIONS.SALES_VIEW, label: "View sale history" },
    ],
  },
  {
    module: "Administration",
    permissions: [
      { key: PERMISSIONS.USERS_MANAGE, label: "Manage users" },
      { key: PERMISSIONS.ROLES_MANAGE, label: "Manage roles and permissions" },
    ],
  },
];

export const defaultRolePermissions = {
  Admin: allPermissions,
  Manager: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.CUSTOMERS_DELETE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_VIEW,
  ],
  Employee: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_VIEW,
  ],
} satisfies Record<string, PermissionKey[]>;
