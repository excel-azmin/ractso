export class UpdateUserProfileImageCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly userId: string,
  ) {}
}
