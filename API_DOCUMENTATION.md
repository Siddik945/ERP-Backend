# Mini ERP Backend API Documentation

Base URL: `http://localhost:5000/api/v1`

All protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

## Response structure

Success:

```json
{
  "success": true,
  "message": "Readable message",
  "meta": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 },
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Readable error message",
  "errors": {}
}
```

## Auth

### Login

`POST /auth/login`

Body:

```json
{
  "email": "admin@erp.com",
  "password": "Admin@12345"
}
```

### Current user

`GET /auth/me`

Protected: Admin, Manager, Employee

## Users

Admin only.

### Create user

`POST /users`

```json
{
  "name": "New Employee",
  "email": "employee2@erp.com",
  "password": "Password@123",
  "role": "Employee"
}
```

### List users

`GET /users?search=admin&page=1&limit=10`

### Update user

`PATCH /users/:id`

```json
{
  "name": "Updated Name",
  "role": "Manager",
  "isActive": true
}
```

## Products

### List products

`GET /products?search=phone&page=1&limit=10&sortBy=createdAt&sortOrder=desc`

Protected: Admin, Manager, Employee

### Create product

`POST /products`

Protected: Admin, Manager

Content-Type: `multipart/form-data`

Fields:

| Field | Type | Required |
|---|---|---|
| productName | string | yes |
| sku | string | yes |
| category | string | yes |
| purchasePrice | number | yes |
| sellingPrice | number | yes |
| stockQuantity | number | yes |
| image | file | yes |

### Update product

`PATCH /products/:id`

Protected: Admin, Manager

Content-Type: `multipart/form-data`

`image` is optional during update.

### Delete product

`DELETE /products/:id`

Protected: Admin, Manager

## Customers

### List customers

`GET /customers?search=walk&page=1&limit=10`

Protected: Admin, Manager, Employee

### Create customer

`POST /customers`

Protected: Admin, Manager

```json
{
  "name": "ABC Store",
  "email": "abc@example.com",
  "phone": "01711111111",
  "address": "Dhaka"
}
```

### Update customer

`PATCH /customers/:id`

Protected: Admin, Manager

### Delete customer

`DELETE /customers/:id`

Protected: Admin, Manager

## Sales

### Create sale

`POST /sales`

Protected: Admin, Manager, Employee

```json
{
  "customer": "customerObjectId",
  "products": [
    { "product": "productObjectId", "quantity": 2 },
    { "product": "anotherProductObjectId", "quantity": 1 }
  ]
}
```

Backend logic:

- Validates customer.
- Validates products.
- Prevents insufficient stock.
- Calculates line totals and grand total using current product selling prices.
- Automatically reduces stock.
- Stores sale history.

### List sales

`GET /sales?page=1&limit=10`

Protected: Admin, Manager, Employee

## Dashboard

### Statistics

`GET /dashboard`

Protected: Admin, Manager, Employee

Returns:

```json
{
  "totalProducts": 12,
  "totalCustomers": 6,
  "totalSales": 25,
  "lowStockProducts": []
}
```
