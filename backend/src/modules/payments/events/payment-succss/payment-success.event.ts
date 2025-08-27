import { IEvent } from '@nestjs/cqrs';

export class PaymentSuccessEvent implements IEvent {
  constructor(public readonly paymentInfo: any) {}
}
