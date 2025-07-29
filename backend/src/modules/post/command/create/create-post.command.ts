import { CreatePostDto } from '../../dto/create-post.dto';

export class CreatePostCommand {
  constructor(
    public readonly createPostDto: CreatePostDto,
    public readonly files: Express.Multer.File[],
    public readonly userId: string,
  ) {}
}
