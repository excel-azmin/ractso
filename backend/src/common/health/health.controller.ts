import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../shared/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prismaService: PrismaService,
    @InjectQueue('post-creation') private postQueue: Queue,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      () =>
        this.prismaHealth.pingCheck('database', this.prismaService, {
          timeout: 3000,
        }),
      () => this.checkQueueHealth(),
    ]);
  }

  @Get('queue')
  async queueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.postQueue.getWaitingCount(),
      this.postQueue.getActiveCount(),
      this.postQueue.getCompletedCount(),
      this.postQueue.getFailedCount(),
      this.postQueue.getDelayedCount(),
    ]);

    return {
      queue: 'post-creation',
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  private async checkQueueHealth(): Promise<HealthIndicatorResult> {
    try {
      const activeCount = await this.postQueue.getActiveCount();
      const waitingCount = await this.postQueue.getWaitingCount();

      return {
        'queue:post-creation': {
          status: 'up',
          active: activeCount,
          waiting: waitingCount,
        },
      };
    } catch (error) {
      return {
        'queue:post-creation': {
          status: 'down',
          message: error.message,
        },
      };
    }
  }
}
