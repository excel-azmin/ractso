import { InjectQueue } from '@nestjs/bull/dist/decorators/inject-queue.decorator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bull';
import { CreatePostCommand } from './create-post.command';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(@InjectQueue('post-creation') private postQueue: Queue) {}

  async execute(command: CreatePostCommand): Promise<any> {
    const { createPostDto, files, userId } = command;

    const fileUrls =
      files && files.length > 0 ? files.map((file) => file.path) : [];

    // Add job to queue for async processing
    const job = await this.postQueue.add(
      'create-post',
      {
        postData: createPostDto,
        userId: userId,
        fileUrls,
      },
      {
        priority: 1,
        removeOnComplete: true,
      },
    );

    return {
      message: 'Post creation queued successfully',
      jobId: job.id,
      status: 'processing',
    };
  }
}
