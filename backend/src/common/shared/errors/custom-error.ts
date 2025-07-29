import { HttpException } from '@nestjs/common';

export class CustomError extends HttpException {
  constructor(
    message: string,
    status: number,
    public readonly data?: any,
  ) {
    super(
      {
        statusCode: status,
        message,
        ...data,
      },
      status,
    );
  }
}
