import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RequestWithUser } from '../interface/response';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.get<string[]>('roles', context.getHandler()) ||
      this.reflector.get<string[]>('roles', context.getClass());

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // ADMIN and MODERATOR have full access
    if (user.roles.includes('ADMIN') || user.roles.includes('MODERATOR')) {
      return true;
    }

    // Check if USER has the required role
    if (!requiredRoles.some((role) => user.roles.includes(role))) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    // For USER role, verify ownership of the resource
    if (user.roles.includes('USER')) {
      return this.verifyOwnership(request);
    }

    return true;
  }

  private async verifyOwnership(request: RequestWithUser): Promise<boolean> {
    const resourceId = this.getResourceId(request);
    const resourceType = this.getResourceType(request);

    if (!resourceId || !resourceType) {
      return true; // No specific resource to check
    }

    switch (resourceType) {
      case 'post':
        return this.verifyPostOwnership(resourceId, request.user.id);
      case 'comment':
        return this.verifyCommentOwnership(resourceId, request.user.id);
      case 'user':
        return resourceId === request.user.id;
      default:
        return true;
    }
  }

  private async verifyPostOwnership(
    postId: string,
    userId: string,
  ): Promise<boolean> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new ForbiddenException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only access posts you created');
    }

    return true;
  }

  private async verifyCommentOwnership(
    commentId: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only access comments you created');
    }

    return true;
  }

  private getResourceId(request: RequestWithUser): string | undefined {
    return request.user?.id;
  }

  private getResourceType(request: RequestWithUser): string | undefined {
    const url = request.url.toLowerCase();
    if (url.includes('posts')) return 'post';
    if (url.includes('comments')) return 'comment';
    if (url.includes('users')) return 'user';
    return undefined;
  }
}
