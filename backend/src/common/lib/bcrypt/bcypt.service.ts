import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService {
  private readonly saltRounds = 10;
  constructor() {}

  async hash(password: string) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
