# Mini ERP Backend API Documentation

## 1. Overview

The Mini ERP backend provides APIs for JWT authentication, database-driven role and permission management, users, products, customers, sales, dashboard statistics, Cloudinary image storage, and real-time notifications with Socket.IO.

## 2. Base URLs

### Local development

```text
HTTP API: http://localhost:5000/api/v1
Socket.IO: http://localhost:5000
```

### Production example

```text
HTTP API: https://your-backend-domain.com/api/v1
Socket.IO: https://your-backend-domain.com
```

Do not append `/api/v1` to the Socket.IO URL.

## 3. Authentication

Protected endpoints require a JWT:

```http
Authorization: Bearer <jwt-token>
```

Missing, invalid, or expired tokens return `401 Unauthorized`.

## 4. Database-Driven Authorization

Each user has a role, and each role contains a list of permissions stored in MongoDB. Protected routes check the user's current permissions from the database.

Example role:

```json
{
  "_id": "roleObjectId",
  "name": "Manager",
  "permissions": [
    "dashboard:view",
    "product:view",
    "product:create",
    "product:update",
    "customer:view",
    "customer:create",
    "customer:update",
    "sale:create",
    "sale:view"
  ]
}
```

When a user is authenticated but lacks permission:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "errors": {}
}
```

Status: `403 Forbidden`

## 5. Permission Reference

| Permission        | Description                               |
| ----------------- | ----------------------------------------- |
| `dashboard:view`  | View dashboard statistics                 |
| `product:view`    | View, search, sort, and paginate products |
| `product:create`  | Create products                           |
| `product:update`  | Update products                           |
| `product:delete`  | Delete products                           |
| `customer:view`   | View, search, and paginate customers      |
| `customer:create` | Create customers                          |
| `customer:update` | Update customers                          |
| `customer:delete` | Delete customers                          |
| `sale:create`     | Create sales                              |
| `sale:view`       | View sale history                         |
| `user:manage`     | Create, list, and update users            |
| `role:manage`     | View roles and update role permissions    |

The exact values must match `src/constants/permissions.ts`.

## 6. Typical Role Permissions

### Admin

```json
[
  "dashboard:view",
  "product:view",
  "product:create",
  "product:update",
  "product:delete",
  "customer:view",
  "customer:create",
  "customer:update",
  "customer:delete",
  "sale:create",
  "sale:view",
  "user:manage",
  "role:manage"
]
```

### Manager

```json
[
  "dashboard:view",
  "product:view",
  "product:create",
  "product:update",
  "product:delete",
  "customer:view",
  "customer:create",
  "customer:update",
  "customer:delete",
  "sale:create",
  "sale:view"
]
```

### Employee

```json
["dashboard:view", "product:view", "customer:view", "sale:create", "sale:view"]
```

These are defaults only. An authorized Admin can change them.

## 7. Standard Response Structure

### Success

```json
{
  "success": true,
  "message": "Readable success message",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  },
  "data": {}
}
```

`meta` is included only for paginated responses.

### Error

```json
{
  "success": false,
  "message": "Readable error message",
  "errors": {}
}
```

## 8. Common Status Codes

| Status | Meaning                           |
| ------ | --------------------------------- |
| `200`  | Request completed successfully    |
| `201`  | Resource created successfully     |
| `400`  | Invalid input or validation error |
| `401`  | Missing, invalid, or expired JWT  |
| `403`  | User lacks required permission    |
| `404`  | Resource not found                |
| `409`  | Duplicate data or stock conflict  |
| `422`  | Unprocessable request             |
| `500`  | Unexpected server error           |

# 9. Authentication API

## 9.1 Login

```http
POST /auth/login
```

Public endpoint.

### Request body

```json
{
  "email": "admin@erp.com",
  "password": "Admin@12345"
}
```

### Success response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token",
    "user": {
      "_id": "userObjectId",
      "name": "Admin User",
      "email": "admin@erp.com",
      "isActive": true,
      "role": {
        "_id": "roleObjectId",
        "name": "Admin",
        "permissions": [
          "dashboard:view",
          "product:view",
          "product:create",
          "product:update",
          "product:delete",
          "customer:view",
          "customer:create",
          "customer:update",
          "customer:delete",
          "sale:create",
          "sale:view",
          "user:manage",
          "role:manage"
        ]
      }
    }
  }
}
```

### Errors

| Status | Reason                      |
| ------ | --------------------------- |
| `400`  | Invalid request body        |
| `401`  | Incorrect email or password |
| `403`  | Account is inactive         |
| `404`  | User not found              |

## 9.2 Current User

```http
GET /auth/me
```

Authentication required.

### Success response

```json
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "_id": "userObjectId",
    "name": "Admin User",
    "email": "admin@erp.com",
    "isActive": true,
    "role": {
      "_id": "roleObjectId",
      "name": "Admin",
      "permissions": ["dashboard:view", "role:manage"]
    }
  }
}
```

# 10. User Management API

Required permission: `user:manage`

## 10.1 Create User

```http
POST /users
```

### Request body

```json
{
  "name": "New Employee",
  "email": "employee2@erp.com",
  "password": "Password@123",
  "role": "Employee"
}
```

The role may be supplied as a role name or role ID depending on the implementation.

### Success response

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "userObjectId",
    "name": "New Employee",
    "email": "employee2@erp.com",
    "isActive": true,
    "role": {
      "_id": "employeeRoleObjectId",
      "name": "Employee"
    }
  }
}
```

## 10.2 List Users

```http
GET /users?search=admin&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

### Query parameters

| Parameter   | Type   | Required | Description                    |
| ----------- | ------ | -------- | ------------------------------ |
| `search`    | string | No       | Search name or email           |
| `page`      | number | No       | Page number; default `1`       |
| `limit`     | number | No       | Results per page; default `10` |
| `sortBy`    | string | No       | Sort field                     |
| `sortOrder` | string | No       | `asc` or `desc`                |

### Success response

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  },
  "data": [
    {
      "_id": "userObjectId",
      "name": "Admin User",
      "email": "admin@erp.com",
      "isActive": true,
      "role": {
        "_id": "roleObjectId",
        "name": "Admin"
      }
    }
  ]
}
```

## 10.3 Update User

```http
PATCH /users/:id
```

### Request body

```json
{
  "name": "Updated Name",
  "role": "Manager",
  "isActive": true
}
```

Only included properties are updated.

# 11. Role and Permission API

Required permission: `role:manage`

## 11.1 List Roles

```http
GET /roles
```

### Success response

```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "_id": "adminRoleObjectId",
      "name": "Admin",
      "permissions": [
        "dashboard:view",
        "product:view",
        "product:create",
        "product:update",
        "product:delete",
        "customer:view",
        "customer:create",
        "customer:update",
        "customer:delete",
        "sale:create",
        "sale:view",
        "user:manage",
        "role:manage"
      ],
      "createdAt": "2026-07-07T10:00:00.000Z",
      "updatedAt": "2026-07-07T10:00:00.000Z"
    }
  ]
}
```

## 11.2 List Available Permissions

```http
GET /roles/permissions
```

### Success response

```json
{
  "success": true,
  "message": "Permissions retrieved successfully",
  "data": [
    "dashboard:view",
    "product:view",
    "product:create",
    "product:update",
    "product:delete",
    "customer:view",
    "customer:create",
    "customer:update",
    "customer:delete",
    "sale:create",
    "sale:view",
    "user:manage",
    "role:manage"
  ]
}
```

## 11.3 Update Role Permissions

```http
PATCH /roles/:id/permissions
```

### Request body

```json
{
  "permissions": [
    "dashboard:view",
    "product:view",
    "product:create",
    "product:update",
    "customer:view",
    "customer:create",
    "customer:update",
    "sale:create",
    "sale:view"
  ]
}
```

### Success response

```json
{
  "success": true,
  "message": "Role permissions updated successfully",
  "data": {
    "_id": "managerRoleObjectId",
    "name": "Manager",
    "permissions": [
      "dashboard:view",
      "product:view",
      "product:create",
      "product:update",
      "customer:view",
      "customer:create",
      "customer:update",
      "sale:create",
      "sale:view"
    ]
  }
}
```

### Errors

| Status | Reason                             |
| ------ | ---------------------------------- |
| `400`  | Invalid permission or request body |
| `403`  | Missing `role:manage`              |
| `404`  | Role not found                     |

# 12. Product API

## Product structure

```json
{
  "_id": "productObjectId",
  "productName": "Wireless Mouse",
  "sku": "MOUSE-001",
  "category": "Accessories",
  "purchasePrice": 500,
  "sellingPrice": 800,
  "stockQuantity": 20,
  "productImage": "https://res.cloudinary.com/cloud-name/image/upload/product.jpg",
  "productImagePublicId": "mini-erp/products/product-public-id",
  "createdAt": "2026-07-07T10:00:00.000Z",
  "updatedAt": "2026-07-07T10:00:00.000Z"
}
```

Images are stored in Cloudinary. MongoDB stores the secure URL and optional Cloudinary public ID.

## 12.1 List Products

```http
GET /products?search=phone&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

Required permission: `product:view`

### Query parameters

| Parameter   | Type   | Required | Description                           |
| ----------- | ------ | -------- | ------------------------------------- |
| `search`    | string | No       | Search product name, SKU, or category |
| `category`  | string | No       | Filter by category                    |
| `page`      | number | No       | Page number                           |
| `limit`     | number | No       | Results per page                      |
| `sortBy`    | string | No       | Sort field                            |
| `sortOrder` | string | No       | `asc` or `desc`                       |

## 12.2 Get Product by ID

```http
GET /products/:id
```

Required permission: `product:view`

## 12.3 Create Product

```http
POST /products
```

Required permission: `product:create`

Content type: `multipart/form-data`

| Field           | Type   | Required |
| --------------- | ------ | -------- |
| `productName`   | string | Yes      |
| `sku`           | string | Yes      |
| `category`      | string | Yes      |
| `purchasePrice` | number | Yes      |
| `sellingPrice`  | number | Yes      |
| `stockQuantity` | number | Yes      |
| `image`         | file   | Yes      |

### cURL example

```bash
curl -X POST "http://localhost:5000/api/v1/products" \
  -H "Authorization: Bearer <jwt-token>" \
  -F "productName=Wireless Mouse" \
  -F "sku=MOUSE-001" \
  -F "category=Accessories" \
  -F "purchasePrice=500" \
  -F "sellingPrice=800" \
  -F "stockQuantity=20" \
  -F "image=@/path/to/mouse.jpg"
```

### Business rules

- Image is required during creation.
- SKU must be unique.
- Prices and stock cannot be negative.
- Only image MIME types are accepted.
- The configured file-size limit applies.

## 12.4 Update Product

```http
PATCH /products/:id
```

Required permission: `product:update`

Content type: `multipart/form-data`

All fields are optional. `image` is optional.

When a new image is uploaded, the new Cloudinary URL is stored and the old image is deleted when possible.

## 12.5 Delete Product

```http
DELETE /products/:id
```

Required permission: `product:delete`

The MongoDB product is deleted. The related Cloudinary image is also deleted when a public ID exists.

# 13. Customer API

## Customer structure

```json
{
  "_id": "customerObjectId",
  "name": "ABC Store",
  "email": "abc@example.com",
  "phone": "01711111111",
  "address": "Dhaka",
  "createdAt": "2026-07-07T10:00:00.000Z",
  "updatedAt": "2026-07-07T10:00:00.000Z"
}
```

## 13.1 List Customers

```http
GET /customers?search=walk&page=1&limit=10
```

Required permission: `customer:view`

## 13.2 Get Customer by ID

```http
GET /customers/:id
```

Required permission: `customer:view`

## 13.3 Create Customer

```http
POST /customers
```

Required permission: `customer:create`

### Request body

```json
{
  "name": "ABC Store",
  "email": "abc@example.com",
  "phone": "01711111111",
  "address": "Dhaka"
}
```

## 13.4 Update Customer

```http
PATCH /customers/:id
```

Required permission: `customer:update`

### Request body

```json
{
  "name": "ABC Store Updated",
  "phone": "01811111111",
  "address": "Chattogram"
}
```

## 13.5 Delete Customer

```http
DELETE /customers/:id
```

Required permission: `customer:delete`

# 14. Sales API

## Sale structure

```json
{
  "_id": "saleObjectId",
  "customer": {
    "_id": "customerObjectId",
    "name": "ABC Store"
  },
  "items": [
    {
      "product": {
        "_id": "productObjectId",
        "productName": "Wireless Mouse",
        "sku": "MOUSE-001"
      },
      "productName": "Wireless Mouse",
      "sku": "MOUSE-001",
      "sellingPrice": 800,
      "quantity": 2,
      "lineTotal": 1600
    }
  ],
  "grandTotal": 1600,
  "createdBy": {
    "_id": "userObjectId",
    "name": "Employee User",
    "email": "employee@erp.com"
  },
  "createdAt": "2026-07-07T10:30:00.000Z",
  "updatedAt": "2026-07-07T10:30:00.000Z"
}
```

## 14.1 Create Sale

```http
POST /sales
```

Required permission: `sale:create`

### Request body

```json
{
  "customer": "customerObjectId",
  "products": [
    {
      "product": "productObjectId",
      "quantity": 2
    },
    {
      "product": "anotherProductObjectId",
      "quantity": 1
    }
  ]
}
```

### Backend logic

- Validates the customer.
- Validates product IDs.
- Requires at least one product.
- Requires positive integer quantities.
- Merges duplicate products.
- Uses current selling prices from MongoDB.
- Prevents insufficient or unavailable stock.
- Prevents negative stock during concurrent requests.
- Calculates line totals and grand total.
- Automatically reduces stock.
- Restores stock if sale creation fails.
- Stores sale history.
- Emits `sale:created`.
- Emits `stock:low` when stock becomes lower than `5`.

### Success response

```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "_id": "saleObjectId",
    "customer": {
      "_id": "customerObjectId",
      "name": "ABC Store"
    },
    "items": [
      {
        "productName": "Wireless Mouse",
        "sku": "MOUSE-001",
        "sellingPrice": 800,
        "quantity": 2,
        "lineTotal": 1600
      }
    ],
    "grandTotal": 1600,
    "createdAt": "2026-07-07T10:30:00.000Z"
  }
}
```

### Errors

| Status | Reason                                               |
| ------ | ---------------------------------------------------- |
| `400`  | Invalid IDs, invalid quantity, or insufficient stock |
| `404`  | Customer or product not found                        |
| `409`  | Stock changed during sale creation                   |
| `403`  | Missing `sale:create`                                |

## 14.2 List Sale History

```http
GET /sales?page=1&limit=10
```

Required permission: `sale:view`

### Success response

```json
{
  "success": true,
  "message": "Sales retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "data": []
}
```

# 15. Dashboard API

## 15.1 Statistics

```http
GET /dashboard
```

Required permission: `dashboard:view`

### Success response

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalProducts": 12,
    "totalCustomers": 6,
    "totalSales": 25,
    "lowStockProducts": [
      {
        "_id": "productObjectId",
        "productName": "Wireless Mouse",
        "sku": "MOUSE-001",
        "stockQuantity": 3,
        "productImage": "https://res.cloudinary.com/cloud-name/image/upload/product.jpg"
      }
    ]
  }
}
```

Low stock means `stockQuantity < 5`.

# 16. Socket.IO Real-Time Notifications

## 16.1 Connection URL

Local:

```text
http://localhost:5000
```

Production:

```text
https://your-backend-domain.com
```

Do not include `/api/v1` in the socket URL.

## 16.2 Authentication

The socket connection uses the same JWT as the HTTP API.

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token"),
  },
  transports: ["polling", "websocket"],
});
```

### Connection error

```ts
socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});
```

Possible reasons:

- Missing token
- Invalid or expired token
- Invalid JWT payload
- Wrong socket URL
- Socket server unavailable
- CORS rejection

## 16.3 Server-to-Client Events

### `socket:ready`

Emitted after authentication succeeds.

```json
{
  "connected": true,
  "userId": "userObjectId"
}
```

```ts
socket.on("socket:ready", (payload) => {
  console.log("Socket ready:", payload);
});
```

### `sale:created`

Emitted after a sale is stored successfully.

```json
{
  "saleId": "saleObjectId",
  "customerId": "customerObjectId",
  "grandTotal": 2500,
  "createdAt": "2026-07-07T10:30:00.000Z"
}
```

```ts
socket.on("sale:created", (sale) => {
  console.log("New sale:", sale);
});
```

Redux notification example:

```ts
socket.on("sale:created", (sale) => {
  dispatch(
    addNotification({
      type: "success",
      title: "New sale created",
      message: `Sale #${sale.saleId.slice(-6)} created. Total: ৳${sale.grandTotal}`,
      createdAt: sale.createdAt,
    }),
  );
});
```

### `stock:low`

Emitted when a sold product has stock lower than `5` after the sale.

```json
{
  "products": [
    {
      "productId": "productObjectId",
      "productName": "Wireless Mouse",
      "sku": "MOUSE-001",
      "stockQuantity": 3
    }
  ],
  "createdAt": "2026-07-07T10:30:00.000Z"
}
```

```ts
socket.on("stock:low", ({ products, createdAt }) => {
  console.log(products, createdAt);
});
```

## 16.4 Client-to-Server Events

### `socket:ping`

```ts
socket.emit("socket:ping", (response) => {
  console.log(response);
});
```

Response:

```json
{
  "success": true,
  "time": "2026-07-07T10:30:00.000Z"
}
```

## 16.5 Disconnect Reasons

| Reason                        | Meaning                               |
| ----------------------------- | ------------------------------------- |
| `client namespace disconnect` | Frontend called `socket.disconnect()` |
| `server namespace disconnect` | Server disconnected the socket        |
| `transport close`             | Network or transport closed           |
| `transport error`             | Polling or WebSocket failed           |
| `ping timeout`                | Client stopped responding             |

`client namespace disconnect` is normal during logout.

## 16.6 Real-Time Workflow

```text
POST /api/v1/sales
        ↓
Validate customer and products
        ↓
Check and reduce stock
        ↓
Create sale in MongoDB
        ↓
Emit sale:created
        ↓
Find sold products with stock < 5
        ↓
Emit stock:low when applicable
        ↓
Connected clients update Redux notification state
```

# 17. CORS

The backend should allow both local and deployed frontend origins.

```ts
const allowedOrigins = ["http://localhost:5173", env.clientUrl].filter(Boolean);
```

Production environment:

```env
CLIENT_URL=https://your-frontend-domain.vercel.app
```

Avoid an unnecessary trailing slash.

# 18. Environment Variables

## Backend

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mini-erp
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Production MongoDB example:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/mini-erp
```

## Frontend

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_FILE_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Production:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api/v1
VITE_FILE_BASE_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

# 19. Deployment

Recommended architecture:

```text
Frontend: Vercel
Backend API + Socket.IO: Render, Railway, Fly.io, or another persistent Node.js host
Database: MongoDB Atlas
Images: Cloudinary
```

After changing Vite environment variables, rebuild and redeploy the frontend.

# 20. Security Notes

- Never expose `JWT_SECRET` in frontend code.
- Never expose `CLOUDINARY_API_SECRET` in frontend code.
- Hash passwords before saving.
- Never return passwords in API responses.
- Validate JWTs on protected routes.
- Validate permissions on every protected action.
- Validate MongoDB ObjectIds.
- Never trust totals sent by the frontend.
- Use current product prices from the database.
- Prevent stock from becoming negative.
- Store images in Cloudinary rather than the server filesystem.
- Use HTTPS in production.
- Limit image MIME type and file size.
- Use a global error handler and consistent response structure.

# 21. Postman Setup

Environment variables:

```text
baseUrl = http://localhost:5000/api/v1
token = <jwt-token>
```

Authorization header:

```http
Authorization: Bearer {{token}}
```

Examples:

```text
{{baseUrl}}/auth/login
{{baseUrl}}/products
{{baseUrl}}/customers
{{baseUrl}}/sales
{{baseUrl}}/dashboard
```

# 22. API Summary

| Module    | Method | Endpoint                 | Permission        |
| --------- | ------ | ------------------------ | ----------------- |
| Auth      | POST   | `/auth/login`            | Public            |
| Auth      | GET    | `/auth/me`               | Authenticated     |
| Users     | POST   | `/users`                 | `user:manage`     |
| Users     | GET    | `/users`                 | `user:manage`     |
| Users     | PATCH  | `/users/:id`             | `user:manage`     |
| Roles     | GET    | `/roles`                 | `role:manage`     |
| Roles     | GET    | `/roles/permissions`     | `role:manage`     |
| Roles     | PATCH  | `/roles/:id/permissions` | `role:manage`     |
| Products  | GET    | `/products`              | `product:view`    |
| Products  | GET    | `/products/:id`          | `product:view`    |
| Products  | POST   | `/products`              | `product:create`  |
| Products  | PATCH  | `/products/:id`          | `product:update`  |
| Products  | DELETE | `/products/:id`          | `product:delete`  |
| Customers | GET    | `/customers`             | `customer:view`   |
| Customers | GET    | `/customers/:id`         | `customer:view`   |
| Customers | POST   | `/customers`             | `customer:create` |
| Customers | PATCH  | `/customers/:id`         | `customer:update` |
| Customers | DELETE | `/customers/:id`         | `customer:delete` |
| Sales     | POST   | `/sales`                 | `sale:create`     |
| Sales     | GET    | `/sales`                 | `sale:view`       |
| Dashboard | GET    | `/dashboard`             | `dashboard:view`  |

## Socket.IO Summary

| Direction       | Event          | Purpose                                      |
| --------------- | -------------- | -------------------------------------------- |
| Server → Client | `socket:ready` | Confirms authenticated socket connection     |
| Server → Client | `sale:created` | Announces a newly created sale               |
| Server → Client | `stock:low`    | Announces products below the stock threshold |
| Client → Server | `socket:ping`  | Checks connection health                     |
