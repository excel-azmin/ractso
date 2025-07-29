import { EnvConfigModule } from '@/common/config/env/env-config.module';
import { Module } from '@nestjs/common';
import { ClerkClientProvider } from './clerk-client.provider';

@Module({
  imports: [EnvConfigModule],
  providers: [ClerkClientProvider],
  exports: ['ClerkClient'],
})
export class ClerkModule {}
