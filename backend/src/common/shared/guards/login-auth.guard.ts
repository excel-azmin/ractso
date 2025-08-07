import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../interface/response';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get the request object
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Check if the user is authenticated
    if (!request.user)
      throw new UnauthorizedException(
        'You are not logged in. Please log in to access this resource.',
      );

    // check users value
    if (!Object?.values(request?.user || {})?.length)
      throw new UnauthorizedException(
        'You are not logged in. Please log in to access this resource.',
      );

    // is the user exists in the database
    // const user = this.userService.getUserById(request.user.id);
    // if (!user) {
    //   throw new UnauthorizedException(
    //     'User not found. Please log in to access this resource.',
    //   );
    // }

    // Return true if the user is authenticated
    return true;
  }
}
