import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentSuccessEvent } from './payment-success.event';

@EventsHandler(PaymentSuccessEvent)
export class PaymentSuccessHandler
  implements IEventHandler<PaymentSuccessEvent>
{
  constructor() {}

  async handle(event: PaymentSuccessEvent) {
    const { paymentInfo } = event;
    console.log('Payment Success status event received:', paymentInfo);
  }
}
