import { LoginUserInfo, VerifyOTPUserInfo } from '../types';

export interface IApiResponse<T> {
  status: boolean;
  path: string;
  statusCode: number;
  message: string;
  response: T | null;
  timestamp: string;
}

export interface RequestWithUser extends Request {
  user: LoginUserInfo;
}

export interface RequestWithOTP extends Request {
  user: VerifyOTPUserInfo;
}
