import { Injectable, OnModuleInit } from '@nestjs/common';
import { RequestEventEmitter } from './event-emitter.service';
@Injectable()
export class EventListener implements OnModuleInit {
  constructor(private readonly eventEmitter: RequestEventEmitter) {}

  onModuleInit() {
    // this.eventEmitter.on(
    //   'sendNotification',
    //   async (notificationPayload: any) => {
    //     await this.notificationService.sendNotification(notificationPayload);
    //   },
    // );
  }
}
