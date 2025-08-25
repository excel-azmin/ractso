import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InitPaymentHandler } from './command/init-payment.handler';
import { PaymentsController } from './controller/payments.controller';
import { PaymentsService } from './service/payments.service';

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, InitPaymentHandler],
})
export class PaymentsModule {}
