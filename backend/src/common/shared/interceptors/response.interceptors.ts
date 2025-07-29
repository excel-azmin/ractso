import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, Observable, of } from 'rxjs';

// response.interceptor.ts
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const isTokenRefresh = request.url.includes('refresh-token');

    return next.handle().pipe(
      map((data) => {
        // For successful responses
        if (isTokenRefresh) {
          response.status(200); // Force 200 for token refresh
          return {
            status: true,
            path: request.url,
            statusCode: 200,
            message: 'Tokens refreshed successfully',
            timestamp: new Date().toISOString(),
            response: data,
          };
        }

        // Default successful response
        return {
          status: true,
          path: request.url,
          statusCode: response.statusCode,
          message: 'Request successful',
          timestamp: new Date().toISOString(),
          response: data,
        };
      }),
      catchError((error) => {
        // Handle errors
        const status = error.getStatus?.() || 500;
        const message =
          error.response?.message || error.message || 'Internal server error';

        response.status(status);

        return of({
          status: false,
          path: request?.url,
          statusCode: status,
          message: message,
          timestamp: new Date().toISOString(),
          response: null,
        });
      }),
    );
  }
}
