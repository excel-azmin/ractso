import { Global, Logger, Module } from '@nestjs/common';
import { EnvConfigService } from './env-config.service';

@Global()
@Module({
  providers: [EnvConfigService, Logger],
  exports: [EnvConfigService, Logger],
})
export class EnvConfigModule {}
