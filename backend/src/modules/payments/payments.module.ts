import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InitPaymentHandler } from './command/init-payment/init-payment.handler';
import { PaymentCancelStatusHandler } from './command/payment-cancel/payment-cancel.handler';
import { PaymentFailStatusHandler } from './command/payment-fail/payment-fail.handler';
import { PaymentSuccessStatusHandler } from './command/payment-success/payment-success.handler';
import { PaymentsController } from './controller/payments.controller';
import { PaymentSuccessHandler } from './events/payment-succss/payment-success.handler';
import { GetMyPaymentsHandler } from './query/get-my-payments/get-my-payments.handler';
import { PaymentSagas } from './sagas/payment.saga';
import { PaymentsService } from './service/payments.service';

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    InitPaymentHandler,
    PaymentSuccessStatusHandler,
    PaymentFailStatusHandler,
    PaymentCancelStatusHandler,
    PaymentSuccessHandler,
    GetMyPaymentsHandler,
    PaymentSagas,
  ],
})
export class PaymentsModule {}
