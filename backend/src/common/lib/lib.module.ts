import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from './bcrypt/bcypt.service';
import { DateService } from './date';
import { ImageDeleteService } from './image/image-delete.service';
import { JsonWebTokenService } from './jwt-token/jsonwebtoken.service';

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    BcryptService,
    JsonWebTokenService,
    DateService,
    ImageDeleteService,
  ],
  exports: [
    BcryptService,
    JsonWebTokenService,
    DateService,
    ImageDeleteService,
  ],
})
export class LibModule {}
