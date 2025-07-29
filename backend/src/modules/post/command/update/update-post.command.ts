import { UpdatePostDto } from '../../dto/update-post.dto';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly updatePostDto: UpdatePostDto,
    public readonly userId: string,
  ) {}
}
