import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostHandler } from './command/create/create-post.handler';
import { UpdatePostCommand } from './command/update/update-post.command';
import { UpdatePostHandler } from './command/update/update-post.handler';
import { PostController } from './controller/post.controller';
import { GetMyPostsHandler } from './query/my-posts/my-posts.handler';
import { GetMyPostsQuery } from './query/my-posts/my-posts.query';
import { GetPostListHandler } from './query/post-list/post-list.handler';
import { GetPostListQuery } from './query/post-list/post-list.query';
import { GetSinglePostHandler } from './query/single-post/single-post.handler';
import { GetSinglePostQuery } from './query/single-post/single-post.query';
import { PostService } from './service/post.service';

@Module({
  imports: [CqrsModule],
  controllers: [PostController],
  providers: [
    PostService,
    CreatePostHandler,
    GetMyPostsQuery,
    GetMyPostsHandler,
    GetSinglePostQuery,
    GetSinglePostHandler,
    GetPostListQuery,
    GetPostListHandler,
    UpdatePostCommand,
    UpdatePostHandler,
  ],
  exports: [PostService],
})
export class PostModule {}
