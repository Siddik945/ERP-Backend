import { RequestHandler } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { DashboardService } from './dashboard.service';

const getDashboardStats: RequestHandler = catchAsync(async (_req, res) => {
  const result = await DashboardService.getDashboardStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: result
  });
});

export const DashboardController = { getDashboardStats };
