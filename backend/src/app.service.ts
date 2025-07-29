import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): any {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Backend is running smoothly',
    };
  }
}
