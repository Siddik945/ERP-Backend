import { RequestHandler } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { SaleService } from './sale.service';

const createSale: RequestHandler = catchAsync(async (req, res) => {
  const result = await SaleService.createSale(req.body, req.user!.userId);
  sendResponse(res, { statusCode: 201, success: true, message: 'Sale created successfully', data: result });
});

const getSales: RequestHandler = catchAsync(async (req, res) => {
  const result = await SaleService.getSales(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sales retrieved successfully',
    data: result.data,
    meta: result.meta
  });
});

export const SaleController = { createSale, getSales };
