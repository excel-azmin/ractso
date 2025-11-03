import { BasePaginationDto } from '@/common/shared/base-classes/base.pagination';
import { Roles } from '@/common/shared/decorator/roles.decorator';
import { UploadPostImages } from '@/common/shared/decorator/upload-post-images.decorator';
import { AuthGuard } from '@/common/shared/guards/login-auth.guard';
import { RolesGuard } from '@/common/shared/guards/roles.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CommandBus } from '@nestjs/cqrs/dist/command-bus';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'generated/prisma';
import { CreatePostCommand } from '../command/create/create-post.command';
import { UpdatePostCommand } from '../command/update/update-post.command';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetMyPostsQuery } from '../query/my-posts/my-posts.query';
import { GetPostListQuery } from '../query/post-list/post-list.query';
import { GetSinglePostQuery } from '../query/single-post/single-post.query';

@ApiTags('Post')
@Controller('v1/post')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UploadPostImages()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ): Promise<any> {
    return await this.commandBus.execute(
      new CreatePostCommand(createPostDto, files, req.user?.id),
    );
  }

  @Get('list')
  async getPostList(@Query() query: BasePaginationDto): Promise<any> {
    return await this.queryBus.execute(new GetPostListQuery(query));
  }

  @Get('my-posts')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  async getMyPosts(@Req() req: any): Promise<any> {
    return await this.queryBus.execute(new GetMyPostsQuery(req.user?.id));
  }

  @Patch(':id/update')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
  ): Promise<any> {
    return await this.commandBus.execute(
      new UpdatePostCommand(id, updatePostDto, req.user?.id),
    );
  }

  @Get(':id')
  async getSinglePost(@Param('id') id: string): Promise<any> {
    return await this.queryBus.execute(new GetSinglePostQuery(id));
  }
}
