import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InitPaymentHandler } from './command/init-payment/init-payment.handler';
import { PaymentSuccessStatusHandler } from './command/payment-success/payment-success.handler';
import { PaymentsController } from './controller/payments.controller';
import { GetMyPaymentsHandler } from './query/get-my-payments/get-my-payments.handler';
import { PaymentsService } from './service/payments.service';

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    InitPaymentHandler,
    PaymentSuccessStatusHandler,
    GetMyPaymentsHandler,
  ],
})
export class PaymentsModule {}
