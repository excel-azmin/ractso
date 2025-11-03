import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bull';
import { HealthController } from './health.controller';
import { PrismaModule } from '../shared/prisma/prisma.module';

@Module({
  imports: [
    TerminusModule,
    PrismaModule,
    BullModule.registerQueue({
      name: 'post-creation',
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
