import { AuthModule } from '@/modules/auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { RequestEventEmitter } from './event-emitter.service';
import { EventListener } from './event-listener.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [RequestEventEmitter, EventListener],
  exports: [RequestEventEmitter],
})
export class RequestEventEmitterModule {}
