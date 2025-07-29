import { UpdateUserProfileImageCommand } from './update-profile-image/update-user-profile-image.command';
import { UpdateUserProfileImageHandler } from './update-profile-image/update-user-profile-image.handler';
import { UpdateUserProfileCommand } from './update-user/update-user.command';
import { UpdateUserProfileHandler } from './update-user/update-user.handler';

export const userCommands = [
  UpdateUserProfileCommand,
  UpdateUserProfileImageCommand,
];

export const userHandlers = [
  UpdateUserProfileHandler,
  UpdateUserProfileImageHandler,
];
