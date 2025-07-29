import { UpdateUserDto } from '../../dto/update-user.dto';

export class UpdateUserProfileCommand {
  constructor(
    public readonly id: string,
    public readonly updateUserDto: UpdateUserDto,
  ) {}
}
