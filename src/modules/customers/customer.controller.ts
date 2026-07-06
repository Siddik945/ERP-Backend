import { RequestHandler } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CustomerService } from './customer.service';

const createCustomer: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomerService.createCustomer(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Customer created successfully', data: result });
});

const getCustomers: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomerService.getCustomers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Customers retrieved successfully',
    data: result.data,
    meta: result.meta
  });
});

const getCustomerById: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomerService.getCustomerById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Customer retrieved successfully', data: result });
});

const updateCustomer: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomerService.updateCustomer(req.params.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Customer updated successfully', data: result });
});

const deleteCustomer: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomerService.deleteCustomer(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Customer deleted successfully', data: result });
});

export const CustomerController = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer };
