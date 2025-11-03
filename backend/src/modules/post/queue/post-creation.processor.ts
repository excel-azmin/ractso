import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';

export interface PostCreationJobData {
  postData: CreatePostDto;
  userId: string;
  fileUrls: string[];
}

@Processor('post-creation')
export class PostCreationProcessor {
  private readonly logger = new Logger(PostCreationProcessor.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Process('create-post')
  async handlePostCreation(job: Job<PostCreationJobData>) {
    const { postData, userId, fileUrls } = job.data;

    this.logger.log(
      `Processing post creation job ${job.id} for user ${userId}`,
    );

    try {
      const post = await this.prismaService.post.create({
        data: {
          content: postData.content,
          images: fileUrls,
          authorId: userId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              image: true,
            },
          },
        },
      });

      this.logger.log(`Successfully created post ${post.id}`);
      return post;
    } catch (error) {
      this.logger.error(
        `Failed to create post for user ${userId}`,
        error.stack,
      );
      throw error; // Will trigger retry based on job options
    }
  }

  @Process('update-post')
  async handlePostUpdate(job: Job) {
    const { postId, updateData, userId } = job.data;

    this.logger.log(`Processing post update job ${job.id} for post ${postId}`);

    try {
      // Verify ownership
      const existingPost = await this.prismaService.post.findFirst({
        where: {
          id: postId,
          authorId: userId,
        },
      });

      if (!existingPost) {
        throw new Error('Post not found or unauthorized');
      }

      const updatedPost = await this.prismaService.post.update({
        where: { id: postId },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              image: true,
            },
          },
        },
      });

      this.logger.log(`Successfully updated post ${postId}`);
      return updatedPost;
    } catch (error) {
      this.logger.error(`Failed to update post ${postId}`, error.stack);
      throw error;
    }
  }
}
