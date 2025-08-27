import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentIpnStatusEvent } from './payment-ipn.event';

@EventsHandler(PaymentIpnStatusEvent)
export class PaymentIpnStatusHandler
  implements IEventHandler<PaymentIpnStatusEvent>
{
  constructor() {}

  async handle(event: PaymentIpnStatusEvent) {
    const { paymentInfo } = event;
    console.log('Payment IPN status event received:', paymentInfo);
  }
}
