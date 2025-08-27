import { IEvent } from '@nestjs/cqrs';

export class PaymentIpnStatusEvent implements IEvent {
  constructor(public readonly paymentInfo: any) {}
}
