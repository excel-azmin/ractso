import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { map, Observable } from 'rxjs';
import { PaymentIpnStatusEvent } from '../events/payment-ipn/payment-ipn.event';

@Injectable()
export class PaymentSagas {
  constructor() {}

  // Define your saga methods here
  @Saga()
  onPaymentIpnStatus = (event$: any): Observable<ICommand> => {
    return event$.pipe(
      ofType(PaymentIpnStatusEvent),
      map((event) => {
        const { paymentInfo } = event;
        console.log(`Payment Sagas Info: ${paymentInfo}`);
      }),
    );
  };
}
