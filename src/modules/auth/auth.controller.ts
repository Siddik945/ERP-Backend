import { RequestHandler } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const login: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthService.login(req.body.email, req.body.password);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged in successfully',
    data: result
  });
});

const me: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthService.me(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile retrieved successfully',
    data: result
  });
});

export const AuthController = { login, me };
